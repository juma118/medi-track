using System.Text.Json;
using FluentValidation;
using MediTrack.Application.Common;

namespace MediTrack.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await WriteAsync(context, 400, "Validation failed",
                ex.Errors.Select(e => $"{e.PropertyName}: {e.ErrorMessage}"));
        }
        catch (AppException ex)
        {
            await WriteAsync(context, ex.StatusCode, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteAsync(context, 500, "An unexpected error occurred.");
        }
    }

    private static async Task WriteAsync(HttpContext context, int status, string message, IEnumerable<string>? errors = null)
    {
        if (context.Response.HasStarted) return;
        context.Response.StatusCode = status;
        context.Response.ContentType = "application/json";
        var payload = JsonSerializer.Serialize(new { status, message, errors },
            new JsonSerializerOptions(JsonSerializerDefaults.Web));
        await context.Response.WriteAsync(payload);
    }
}
