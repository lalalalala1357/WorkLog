using Modules.WorkLogs.Features.Features.Shared;
using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Features.Features.CreateWorkItem;

public sealed class CreateWorkItemHandler(
    IWorkLogsRepository repository) : ICreateWorkItemHandler
{
    public async Task<CreateWorkItemResult> HandleAsync(
        Guid workLogId,
        Guid employeeId,
        CreateWorkItemRequest request,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();

        var workLog = await repository.GetByIdAsync(workLogId, employeeId);

        if (workLog is null)
        {
            return new CreateWorkItemResult(null, CreateWorkItemError.NotFound);
        }
        
        if (!string.Equals(workLog.Status, "DRAFT", StringComparison.Ordinal))
        {
            return new CreateWorkItemResult(null, CreateWorkItemError.NotDraft);
        }
        
        var nextSeq = checked((short)(
            workLog.WorkItems
                .Select(workItem => (int)workItem.Seq)
                .DefaultIfEmpty(0)
                .Max() + 1));

        var workItem = new WorkItem
        {
            Id = Guid.NewGuid(),
            Seq = nextSeq,
            TaskName = request.TaskName.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description)
                ? null
                : request.Description.Trim(),
            Hours = request.Hours,
            Progress = request.Progress
        };

        workLog.WorkItems.Add(workItem);
        workLog.TotalHours = workLog.WorkItems.Sum(item => item.Hours);
        workLog.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateAsync(workLog);

        var response = new CreateWorkItemResponse(
            new WorkItemResponse(
                workItem.Id,
                workItem.Seq,
                workItem.TaskName,
                workItem.Description,
                workItem.Hours,
                workItem.Progress),
            workLog.TotalHours.Value);

        return new CreateWorkItemResult(response, CreateWorkItemError.None);
    }
}
