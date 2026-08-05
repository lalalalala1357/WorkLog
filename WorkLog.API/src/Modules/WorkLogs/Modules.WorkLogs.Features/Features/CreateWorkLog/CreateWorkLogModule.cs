using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.CreateWorkLog;

public sealed class CreateWorkLogModule : ICarterModule
{
    private static readonly Guid DevelopmentEmployeeId =
        Guid.Parse("3f1b8b1a-2b3e-4a1a-9f2a-0f1e2d3c4b5a");

    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/worklogs", HandleAsync)
            .Produces<ApiResponse<WorkLogDetailResponse>>(StatusCodes.Status201Created);
    }

    private static async Task<IResult> HandleAsync(
        ICreateWorkLogHandler handler,
        CancellationToken cancellationToken)
    {
        var workLog = await handler.HandleAsync(DevelopmentEmployeeId, cancellationToken);

        return Results.Created(
            $"/api/worklogs/{workLog.Id}",
            ApiResponse<WorkLogDetailResponse>.Ok(workLog));
    }
}
