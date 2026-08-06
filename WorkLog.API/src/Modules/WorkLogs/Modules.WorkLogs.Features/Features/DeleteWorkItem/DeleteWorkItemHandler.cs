using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Features.Features.DeleteWorkItem;

public sealed class DeleteWorkItemHandler(
    IWorkLogsRepository repository) : IDeleteWorkItemHandler
{
    public async Task<DeleteWorkItemResult> HandleAsync(
        Guid workLogId,
        Guid itemId,
        Guid employeeId,
        CancellationToken cancellationToken = default)

    {
        cancellationToken.ThrowIfCancellationRequested();

        var workLog = await repository.GetByIdAsync(
            workLogId,
            employeeId);

        if (workLog is null)
        {
            return new DeleteWorkItemResult(
                null,
                DeleteWorkItemError.NotFound);
        }
        
        if (!string.Equals(
            workLog.Status,
            "DRAFT",
            StringComparison.Ordinal))
        {
            return new DeleteWorkItemResult(
                null,
                DeleteWorkItemError.NotDraft);
        }

        var workItem = workLog.WorkItems.FirstOrDefault(
            item => item.Id == itemId);

        if (workItem is null)
        {
            return new DeleteWorkItemResult(
                null,
                DeleteWorkItemError.NotFound);
        }

        workLog.WorkItems.Remove(workItem);
        workLog.TotalHours = workLog.WorkItems.Count == 0 
            ? null
            : workLog.WorkItems.Sum(item => item.Hours);

        workLog.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateAsync(workLog);

        return new DeleteWorkItemResult(
            new DeleteWorkItemResponse(workLog.TotalHours),
            DeleteWorkItemError.None);
    }
}
