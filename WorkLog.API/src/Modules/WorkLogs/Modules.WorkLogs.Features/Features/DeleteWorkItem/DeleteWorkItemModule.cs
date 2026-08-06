using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;

namespace Modules.WorkLogs.Features.Features.DeleteWorkItem;

public sealed class DeleteWorkItemModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/worklogs/{logId:guid}/items/{itemId:guid}", HandleAsync)
            .Produces<ApiResponse<DeleteWorkItemResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<DeleteWorkItemResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<DeleteWorkItemResponse>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        Guid logId,
        Guid itemId,
        IDeleteWorkItemHandler handler,
        CancellationToken cancellationToken)

    {
        var result = await handler.HandleAsync(
            logId,
            itemId,
            DevelopmentEmployeeId,
            cancellationToken);

        return result.Error switch
        {
            DeleteWorkItemError.NotFound =>
                Results.NotFound(
                    ApiResponse<DeleteWorkItemResponse>.Failure(
                        "找不到工作日誌或工作細項")),

            DeleteWorkItemError.NotDraft =>
                Results.BadRequest(
                    ApiResponse<DeleteWorkItemResponse>.Failure(
                        "已送出的日誌無法修改工作細項")),

            _ => Results.Ok(
                new ApiResponse<DeleteWorkItemResponse>(
                    true,
                    result.Response,
                    "刪除成功",
                    null))
        };
    }
}
