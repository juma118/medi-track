namespace MediTrack.Application.Common;

public class AppException : Exception
{
    public int StatusCode { get; }

    public AppException(string message, int statusCode = 400) : base(message)
        => StatusCode = statusCode;

    public static AppException NotFound(string what) => new($"{what} not found.", 404);
    public static AppException Forbidden(string message = "You do not have access to this resource.") => new(message, 403);
    public static AppException Conflict(string message) => new(message, 409);
}
