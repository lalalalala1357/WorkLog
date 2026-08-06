using Modules.Common.Features;

namespace Modules.WorkLogs.Features.Features.DeleteWorkItem;

public interface IDeleteWorkItemHandler : IHandler
{
    Task<DeleteWorkItemResult> HandleAsync(
        Guid workLogId,
        Guid itemId,
        Guid employeeId,
        CancellationToken cancellationToken = default);
}
