using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Features.Features.DeleteWorkLog;

public sealed class DeleteWorkLogHandler(IWorkLogsRepository repository) : IDeleteWorkLogHandler
{
    public async Task<DeleteWorkLogResult> HandleAsync(
        Guid id,
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var workLog = await repository.GetByIdAsync(id, employeeId);

        if (workLog is null)
        {
            return new DeleteWorkLogResult(DeleteWorkLogError.NotFound);
        }

        if(!string.Equals(workLog.Status, "DRAFT", StringComparison.Ordinal))
        {
            return new DeleteWorkLogResult(DeleteWorkLogError.NotDraft);
        }

        await repository.DeleteAsync(workLog);

        return new DeleteWorkLogResult(DeleteWorkLogError.None);
    }
}
