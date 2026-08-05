using Modules.WorkLogs.Domains.WorkLogsAggregate;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.CreateWorkLog;

public sealed class CreateWorkLogHandler(
    IWorkLogsRepository repository) : ICreateWorkLogHandler
{
    public async Task<WorkLogDetailResponse> HandleAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var logDate = DateOnly.FromDateTime(DateTime.UtcNow);
        var latestSequence = await repository.GetLatestSequenceByEmployeeAndDateAsync(employeeId, logDate);
        var workLog = new WorkLog
        {
            EmployeeId = employeeId,
            LogDate = logDate,
            LogNo = $"WD{logDate:yyyyMMdd}{latestSequence + 1:D4}"
        };

        await repository.AddAsync(workLog);

        return WorkLogDetailResponse.From(workLog);
    }
}
