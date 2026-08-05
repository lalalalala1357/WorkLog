using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.UpdateWorkLog;

public sealed class UpdateWorkLogModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/worklogs/{workLogId:guid}", HandleAsync)
            .Produces<ApiResponse<WorkLogDetailResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<WorkLogDetailResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<WorkLogDetailResponse>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        Guid workLogId,
        UpdateWorkLogRequest request,
        IUpdateWorkLogHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.HandleAsync(
            workLogId,
            DevelopmentEmployeeId,
            request,
            cancellationToken);

        return result.Error switch
        {
            UpdateWorkLogError.NotFound => Results.NotFound(ApiResponse<WorkLogDetailResponse>.Failure("找不到工作日誌")),
            UpdateWorkLogError.NotDraft => Results.BadRequest(ApiResponse<WorkLogDetailResponse>.Failure("僅能編輯草稿狀態的日誌")),
            UpdateWorkLogError.InvalidShiftType => Results.BadRequest(ApiResponse<WorkLogDetailResponse>.ValidationFailure(
                [
                    new FieldError("shiftTypeId", "找不到指定的班別")
                ])),
            _ => Results.Ok(ApiResponse<WorkLogDetailResponse>.Ok(result.WorkLog!))

        };
    }
}
