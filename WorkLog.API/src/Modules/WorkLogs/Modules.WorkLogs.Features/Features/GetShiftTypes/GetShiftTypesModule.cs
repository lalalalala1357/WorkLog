using Carter;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Modules.Common.Features.Responses;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.GetShiftTypes;

public sealed class GetShiftTypesModule : ICarterModule
{
    public void AddRoutes(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/shift-types", HandleAsync)
            .Produces<ApiResponse<IReadOnlyList<ShiftTypeResponse>>>(StatusCodes.Status200OK);
    }

    private static async Task<IResult> HandleAsync(
        IGetShiftTypesHandler handler,
        CancellationToken cancellationToken)
    {
        var shiftTypes = await handler.HandleAsync(cancellationToken);
        return Results.Ok(ApiResponse<IReadOnlyList<ShiftTypeResponse>>.Ok(shiftTypes));
    }
}
