using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Features.Features.Shared;

public sealed record WorkLogSummaryResponse(
    Guid Id,
    string LogNo,
    DateOnly LogDate,
    string Status,
    string? Summary,
    decimal? TotalHours)
{
    public static WorkLogSummaryResponse From(WorkLog workLog)
    {
        return new WorkLogSummaryResponse(
            workLog.Id,
            workLog.LogNo,
            workLog.LogDate,
            workLog.Status,
            workLog.WorkItems
                .OrderBy(workItem => workItem.Seq)
                .Select(workItem => workItem.TaskName)
                .FirstOrDefault(),
            workLog.TotalHours);
    }
}
