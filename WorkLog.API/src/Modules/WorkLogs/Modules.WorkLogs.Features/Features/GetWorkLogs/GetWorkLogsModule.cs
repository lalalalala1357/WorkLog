using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.GetWorkLogs;

public sealed class GetWorkLogsModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/worklogs", HandleAsync)
            .Produces<ApiResponse<IReadOnlyList<WorkLogSummaryResponse>>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<IReadOnlyList<WorkLogSummaryResponse>>>(StatusCodes.Status400BadRequest);
    }

    private static async Task<IResult> HandleAsync(
        int? year,
        int? month,
        string? status,
        IGetWorkLogsHandler handler,
        CancellationToken cancellationToken)
    {
        var errors = new List<FieldError>();

        if(year is null)
        {
            errors.Add(new FieldError
            (
                "year",
                "年份為必填欄位"
                ));
        }

        if(month is null)
        {
            errors.Add(new FieldError
            (
                "month",
                "月份為必填欄位"
                ));
        }

        else if (month is < 1 or > 12)
        {
            errors.Add(new FieldError
            (
                "month",
                "月份必須介於 1 到 12 之間"
                ));
        }

        if(!string.IsNullOrWhiteSpace(status) &&
            !string.Equals(
                status,
                "DRAFT",
                StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(
                status,
                "SUBMITTED",
                StringComparison.OrdinalIgnoreCase))
        {
            errors.Add(new FieldError
            (
                "status",
                "狀態必須為 DRAFT、SUBMITTED"
                ));
        }

        if (errors.Count > 0)
        {
            return Results.BadRequest(
                ApiResponse<IReadOnlyList<WorkLogSummaryResponse>>
                    .ValidationFailure(errors));
        }

        var workLogs = await handler.HandleAsync(
            DevelopmentEmployeeId,
            year!.Value,
            month!.Value,
            status,
            cancellationToken);

        return Results.Ok(ApiResponse<IReadOnlyList<WorkLogSummaryResponse>>.Ok(workLogs));
    }
}
