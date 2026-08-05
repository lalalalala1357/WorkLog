using Modules.Common.Features;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.GetShiftTypes;

public interface IGetShiftTypesHandler : IHandler
{
    Task<IReadOnlyList<ShiftTypeResponse>> HandleAsync(
        CancellationToken cancellationToken = default);
}
