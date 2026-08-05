using Modules.WorkLogs.Domains.WorkLogsAggregate;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.GetWorkLogs;

public sealed class GetWorkLogsHandler(
    IWorkLogsRepository repository) : IGetWorkLogsHandler
{
    public async Task<IReadOnlyList<WorkLogSummaryResponse>> HandleAsync(
        Guid employeeId,
        int year,
        int month,
        string? status,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var workLogs = await repository.GetByEmployeeAndMonthAsync(
            employeeId,
            year,
            month);

        if(!string.IsNullOrWhiteSpace(status))
        {
            workLogs = workLogs.Where(worklog =>
                string.Equals(
                    worklog.Status,
                    status,
                    StringComparison.OrdinalIgnoreCase));
        }
        return workLogs
            .OrderByDescending(worklog => worklog.LogDate)
            .ThenByDescending(worklog => worklog.LogNo)
            .Select(WorkLogSummaryResponse.From)
            .ToList();
    }
}
