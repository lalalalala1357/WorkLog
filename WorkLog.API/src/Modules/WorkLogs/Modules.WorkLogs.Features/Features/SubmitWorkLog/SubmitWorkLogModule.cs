using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;

namespace Modules.WorkLogs.Features.Features.SubmitWorkLog;

public sealed class SubmitWorkLogModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/worklogs/{workLogId:guid}/submit",HandleAsync)
            .Produces<ApiResponse<SubmitWorkLogResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<SubmitWorkLogResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<SubmitWorkLogResponse>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        Guid workLogId,
        ISubmitWorkLogHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(workLogId, DevelopmentEmployeeId, cancellationToken);

        return result.Error switch
        {
            SubmitWorkLogError.NotFound =>
                Results.NotFound(ApiResponse<SubmitWorkLogResponse>.Failure(
                    "找不到工作日誌")),

            SubmitWorkLogError.AlreadySubmitted =>
                Results.BadRequest(ApiResponse<SubmitWorkLogResponse>.Failure(
                    "此日誌已送出，無法重複送出")),

            _ => Results.Ok(ApiResponse<SubmitWorkLogResponse>.Ok(result.WorkLog!))
        };
    }
}
