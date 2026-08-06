using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;

namespace Modules.WorkLogs.Features.Features.UpdateWorkItem;

public sealed class UpdateWorkItemModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/worklogs/{logId:guid}/items/{itemId:guid}", HandleAsync)
            .Produces<ApiResponse<UpdateWorkItemResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<UpdateWorkItemResponse>>(StatusCodes.Status400BadRequest)
            .Produces<ApiResponse<UpdateWorkItemResponse>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        Guid logId,
        Guid itemId,
        UpdateWorkItemRequest request,
        IUpdateWorkItemHandler handler,
        CancellationToken cancellationToken)
    {
        var errors = Validate(request);

        if(errors.Count > 0)
        {
            return Results.BadRequest(
                new ApiResponse<UpdateWorkItemResponse>(
                    false,
                    null,
                    "輸入資料有誤",
                    errors));
        }

        var result = await handler.HandleAsync(
            logId,
            itemId,
            DevelopmentEmployeeId,
            request,
            cancellationToken);

        return result.Error switch
        {
            UpdateWorkItemError.NotFound =>
                Results.NotFound(
                    ApiResponse<UpdateWorkItemResponse>.Failure(
                        "找不到工作日誌或工作細項")),


            UpdateWorkItemError.NotDraft =>
                Results.BadRequest(
                    ApiResponse<UpdateWorkItemResponse>.Failure(
                        "已送出的日誌無法修改工作細項")),

            _ => Results.Ok(
                    ApiResponse<UpdateWorkItemResponse>.Ok(
                        result.Response!))
        };
    }

    private static List<FieldError> Validate(
        UpdateWorkItemRequest request)
    {
        var errors = new List<FieldError>();

        if (string.IsNullOrWhiteSpace(request.TaskName))
        {
            errors.Add(
                new FieldError(
                    "taskName",
                    "工作摘要為必填"));
        }

        else if(request.TaskName.Trim().Length > 200)
        {
            errors.Add(
                new FieldError(
                    "taskName",
                    "工作摘要不可超過 200 個字元"));
        }


        if (request.Hours <= 0)
        {
            errors.Add(
                new FieldError(
                    "hours",
                    "時數必須大於 0"));
        }

        if (request.Progress is < 0 or > 100)
        {
            errors.Add(
                new FieldError(
                    "progress",
                    "完成百分比必須介於 0 到 100"));
        }

        return errors;
    }
}
