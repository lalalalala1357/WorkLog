using Modules.Common.Features;

namespace Modules.WorkLogs.Features.Features.UpdateWorkItem;

public interface IUpdateWorkItemHandler : IHandler
{
    Task<UpdateWorkItemResult> HandleAsync(
        Guid workLogId,
        Guid itemId,
        Guid employeeId,
        UpdateWorkItemRequest request,
        CancellationToken cancellationToken = default);
}
