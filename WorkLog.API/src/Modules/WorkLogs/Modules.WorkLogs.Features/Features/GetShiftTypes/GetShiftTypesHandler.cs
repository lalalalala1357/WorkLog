using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.GetShiftTypes;

public sealed class GetShiftTypesHandler : IGetShiftTypesHandler
{
    public Task<IReadOnlyList<ShiftTypeResponse>> HandleAsync(
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        IReadOnlyList<ShiftTypeResponse> shiftTypes =
        [
            DevelopmentShiftTypes.Normal
        ];

        return Task.FromResult(shiftTypes);
    }
}
