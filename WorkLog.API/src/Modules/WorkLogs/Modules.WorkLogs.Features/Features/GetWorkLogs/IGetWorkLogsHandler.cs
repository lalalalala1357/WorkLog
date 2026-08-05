using Modules.Common.Features;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.GetWorkLogs;

public interface IGetWorkLogsHandler : IHandler
{
    Task<IReadOnlyList<WorkLogSummaryResponse>> HandleAsync(
        Guid employeeId,
        int year,
        int month,
        string? status,
        CancellationToken cancellationToken = default);
}
