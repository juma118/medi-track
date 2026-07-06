using System.Text;
using MediTrack.Api.Middleware;
using MediTrack.Api.Realtime;
using MediTrack.Api.Security;
using MediTrack.Application;
using MediTrack.Application.Abstractions;
using MediTrack.Infrastructure;
using MediTrack.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

// ---- Services ----
builder.Services.AddControllers(o => o.Filters.Add<ValidationFilter>());
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// JWT auth
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not configured.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = ctx =>
            {
                var accessToken = ctx.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) && ctx.HttpContext.Request.Path.StartsWithSegments("/hubs"))
                    ctx.Token = accessToken;
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

var signalR = builder.Services.AddSignalR();
var redisConn = builder.Configuration.GetConnectionString("Redis");
if (!string.IsNullOrWhiteSpace(redisConn))
    signalR.AddStackExchangeRedis(redisConn, o => o.Configuration.ChannelPrefix = StackExchange.Redis.RedisChannel.Literal("meditrack"));

// CORS for the React frontend
const string CorsPolicy = "frontend";
builder.Services.AddCors(o => o.AddPolicy(CorsPolicy, p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? new[] { "http://localhost:5173" })
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

// Swagger with bearer auth
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "MediTrack API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme { Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" } },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddHostedService<MediTrack.Api.Realtime.RecordSummarizedConsumer>();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("ai", o =>
    {
        o.PermitLimit = 10;
        o.Window = TimeSpan.FromMinutes(1);
        o.QueueLimit = 0;
    });
});

var pgConn = builder.Configuration.GetConnectionString("Postgres")!;
var hc = builder.Services.AddHealthChecks().AddNpgSql(pgConn, name: "postgres");
if (!string.IsNullOrWhiteSpace(redisConn)) hc.AddRedis(redisConn, name: "redis");
hc.AddKafka(new Confluent.Kafka.ProducerConfig { BootstrapServers = builder.Configuration["Kafka:BootstrapServers"] }, name: "kafka");

var otelConsole = builder.Environment.IsDevelopment();
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService("MediTrack.Api"))
    .WithTracing(t =>
    {
        t.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation();
        if (otelConsole) t.AddConsoleExporter();
    })
    .WithMetrics(m => m.AddAspNetCoreInstrumentation().AddHttpClientInstrumentation());

var app = builder.Build();

// ---- Pipeline ----
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors(CorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();
app.MapHub<NotificationsHub>("/hubs/notifications");
app.MapHealthChecks("/health");

if (builder.Configuration.GetValue("Database:MigrateOnStartup", true))
    await DbSeeder.MigrateAndSeedAsync(app.Services);

app.Run();
