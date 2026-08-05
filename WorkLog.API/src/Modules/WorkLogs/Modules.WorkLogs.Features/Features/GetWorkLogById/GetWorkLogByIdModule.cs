using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.GetWorkLogById;

public sealed class GetWorkLogByIdModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId = Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/worklogs/{id:guid}", HandleAsync)
            .Produces<ApiResponse<WorkLogDetailResponse>>(StatusCodes.Status200OK)
            .Produces<ApiResponse<WorkLogDetailResponse>>(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        Guid id,
        IGetWorkLogByIdHandler handler,
        CancellationToken cancellationToken)
    {
        var workLog = await handler.HandleAsync(id, DevelopmentEmployeeId, cancellationToken);

        if (workLog == null)
        {
            return Results.NotFound(ApiResponse<WorkLogDetailResponse>.Failure("找不到工作日誌"));
        }

        return Results.Ok(ApiResponse<WorkLogDetailResponse>.Ok(workLog));
    }
}
