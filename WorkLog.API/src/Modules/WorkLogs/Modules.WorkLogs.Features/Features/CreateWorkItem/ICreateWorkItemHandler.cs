using Modules.Common.Features;

namespace Modules.WorkLogs.Features.Features.CreateWorkItem;

public interface ICreateWorkItemHandler : IHandler
{
    Task<CreateWorkItemResult> HandleAsync(
        Guid workLogId,
        Guid employeeId,
        CreateWorkItemRequest request,
        CancellationToken cancellationToken = default);
}
