using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Features.Features.SubmitWorkLog;

public sealed class SubmitWorkLogHandler(IWorkLogsRepository repository) : ISubmitWorkLogHandler
{
    public async Task<SubmitWorkLogResult> HandleAsync(
        Guid id,
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var workLog = await repository.GetByIdAsync(id, employeeId);

        if (workLog is null)
        {
            return new SubmitWorkLogResult(null, SubmitWorkLogError.NotFound);
        }

        if(!string.Equals(
            workLog.Status,
            "DRAFT",
            StringComparison.Ordinal))
        {
            return new SubmitWorkLogResult(null, SubmitWorkLogError.AlreadySubmitted);
        }

        var submittedAt = DateTime.UtcNow;

        await repository.UpdateStatusAsync(workLog.Id, "SUBMITTED", submittedAt);

        return new SubmitWorkLogResult(
            new SubmitWorkLogResponse(
                workLog.Id,
                workLog.LogNo,
                "SUBMITTED",
                submittedAt),
            SubmitWorkLogError.None);
    }
}