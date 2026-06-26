using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;

namespace MediTrack.Api.Middleware;

/// <summary>Validates every action argument that has a registered FluentValidation validator.</summary>
public class ValidationFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _sp;

    public ValidationFilter(IServiceProvider sp) => _sp = sp;

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var arg in context.ActionArguments.Values)
        {
            if (arg is null) continue;
            var validatorType = typeof(IValidator<>).MakeGenericType(arg.GetType());
            if (_sp.GetService(validatorType) is IValidator validator)
            {
                var ctx = new ValidationContext<object>(arg);
                var result = await validator.ValidateAsync(ctx, context.HttpContext.RequestAborted);
                if (!result.IsValid)
                    throw new ValidationException(result.Errors);
            }
        }

        await next();
    }
}
