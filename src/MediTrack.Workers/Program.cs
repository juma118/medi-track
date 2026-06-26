using MediTrack.Application.Abstractions;
using MediTrack.Infrastructure;
using MediTrack.Workers;
using MediTrack.Workers.Consuming;

var builder = Host.CreateApplicationBuilder(args);

// Workers share the Infrastructure layer (DbContext, Redis, Kafka, AI, file storage).
builder.Services.AddInfrastructure(builder.Configuration);

// No HTTP context in workers — audit actor is system/unknown.
builder.Services.AddSingleton<ICurrentUser, NullCurrentUser>();

// Kafka consumers
builder.Services.AddHostedService<AiSummaryWorker>();
builder.Services.AddHostedService<NotificationWorker>();
builder.Services.AddHostedService<AuditWorker>();

var host = builder.Build();
host.Run();
