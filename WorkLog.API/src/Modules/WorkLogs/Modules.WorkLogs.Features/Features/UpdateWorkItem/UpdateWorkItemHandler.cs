using Modules.WorkLogs.Domains.WorkLogsAggregate;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.UpdateWorkItem;

public sealed class UpdateWorkItemHandler(
    IWorkLogsRepository repository) : IUpdateWorkItemHandler
{
    public async Task<UpdateWorkItemResult> HandleAsync(
        Guid workLogId,
        Guid itemId,
        Guid employeeId,
        UpdateWorkItemRequest request,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var workLog = await repository.GetByIdAsync(workLogId, employeeId);

        if (workLog is null)
        {
            return new UpdateWorkItemResult(null, UpdateWorkItemError.NotFound);
        }

        if (!string.Equals(
            workLog.Status,
            "DRAFT",
            StringComparison.Ordinal))
        {
            return new UpdateWorkItemResult(null, UpdateWorkItemError.NotDraft);
        }
        
        var workItem = workLog.WorkItems.FirstOrDefault(item => item.Id == itemId);

        if (workItem is null)
        {
            return new UpdateWorkItemResult(null, UpdateWorkItemError.NotFound);
        }

        workItem.TaskName = request.TaskName.Trim();
        workItem.Description =
            string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim();

        workItem.Hours = request.Hours;

        workItem.Progress = request.Progress;

        workLog.TotalHours = workLog.WorkItems.Sum(item => item.Hours);

        workLog.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateAsync(workLog);

        var response = new UpdateWorkItemResponse(
            new WorkItemResponse(
                workItem.Id,
                workItem.Seq,
                workItem.TaskName,
                workItem.Description,
                workItem.Hours,
                workItem.Progress),
            workLog.TotalHours.Value);
                
        return new UpdateWorkItemResult(
            response,
            UpdateWorkItemError.None);
    }
}
