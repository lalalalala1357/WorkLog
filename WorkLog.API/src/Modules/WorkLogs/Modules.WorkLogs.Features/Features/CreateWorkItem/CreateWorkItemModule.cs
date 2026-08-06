using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;

namespace Modules.WorkLogs.Features.Features.CreateWorkItem;

public sealed class CreateWorkItemModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/worklogs/{logId:guid}/items", HandleAsync)
                .Produces<ApiResponse<CreateWorkItemResponse>>(StatusCodes.Status201Created)
                .Produces<ApiResponse<CreateWorkItemResponse>>(StatusCodes.Status400BadRequest)
                .Produces<ApiResponse<CreateWorkItemResponse>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(

        Guid logId,
        CreateWorkItemRequest request,
        ICreateWorkItemHandler handler,
        CancellationToken cancellationToken)
    {
        var errors = Validate(request);

        if (errors.Count > 0)
        {
            return Results.BadRequest(
                new ApiResponse<CreateWorkItemResponse>(
                    false,
                    null,
                    "輸入資料有誤",
                    errors));
        }

        var result = await handler.HandleAsync(
            logId,
            DevelopmentEmployeeId,
            request,
            cancellationToken);

        return result.Error switch
        {
            CreateWorkItemError.NotFound =>
                Results.NotFound(
                    ApiResponse<CreateWorkItemResponse>.Failure("找不到工作日誌")),

            CreateWorkItemError.NotDraft =>
                Results.BadRequest(
                ApiResponse<CreateWorkItemResponse>.Failure("已送出的日誌無法修改工作細項")),

            _ => Results.Created(
                $"/api/worklogs/{logId}/items/{result.Response!.Item.Id}",
                    ApiResponse<CreateWorkItemResponse>.Ok(result.Response!))
        };
    }

    private static List<FieldError> Validate(
        CreateWorkItemRequest request)
    {
        var errors = new List<FieldError>();

        if (string.IsNullOrWhiteSpace(request.TaskName))
        {
            errors.Add(
                new FieldError(
                    "taskName",
                    "工作摘要為必填"));
        }

        else if (request.TaskName.Trim().Length > 200)
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

        if (request.Progress  is < 0 or > 100)
        {
            errors.Add(
                new FieldError(
                    "progress",
                    "完成百分比必須介於 0 到 100"));
        }

        return errors;
    }
}