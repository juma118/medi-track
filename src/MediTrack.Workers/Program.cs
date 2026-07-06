using MediTrack.Application.Abstractions;
using MediTrack.Infrastructure;
using MediTrack.Workers;
using MediTrack.Workers.Consuming;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddSingleton<ICurrentUser, NullCurrentUser>();

// Kafka consumers
builder.Services.AddHostedService<AiSummaryWorker>();
builder.Services.AddHostedService<NotificationWorker>();
builder.Services.AddHostedService<AuditWorker>();

var host = builder.Build();
host.Run();
