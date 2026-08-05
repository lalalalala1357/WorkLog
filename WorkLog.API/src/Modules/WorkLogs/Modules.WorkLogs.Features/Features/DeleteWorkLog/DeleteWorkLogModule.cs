using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;

namespace Modules.WorkLogs.Features.Features.DeleteWorkLog;

public sealed class DeleteWorkLogModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/worklogs/{workLogId:guid}", HandleAsync)
            .Produces<ApiResponse<object?>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<object?>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<object?>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        Guid workLogId,
        IDeleteWorkLogHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(
            workLogId,
            DevelopmentEmployeeId,
            cancellationToken);

        return result.Error switch
        {
            DeleteWorkLogError.NotFound => Results.NotFound(ApiResponse<object?>.Failure("找不到工作日誌")),
            DeleteWorkLogError.NotDraft => Results.BadRequest(ApiResponse<object?>.Failure("僅能刪除草稿狀態的日誌")),
            _ => Results.Ok(new ApiResponse<object?>(true, null, "刪除成功", null))
        };
    }
}
