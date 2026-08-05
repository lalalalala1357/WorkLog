namespace Modules.Common.Features.Responses;

public sealed record FieldError(
    string Field,
    string Message);

public sealed record ApiResponse<T>(
    bool Success,
    T? Data,
    string? Message,
    IReadOnlyList<FieldError>? Errors)
{
    public static ApiResponse<T> Failure(string message)
    {
        return new ApiResponse<T>(
            false,
            default,
            message,
            null);
    }

    public static ApiResponse<T> ValidationFailure(IReadOnlyList<FieldError> errors)
    {
        return new ApiResponse<T>(
            false,
            default,
            "資料驗證失敗",
            errors);
    }

    public static ApiResponse<T> Ok(T data)
    {
        return new ApiResponse<T>(
            true,
            data,
            null,
            null);
    }
}
