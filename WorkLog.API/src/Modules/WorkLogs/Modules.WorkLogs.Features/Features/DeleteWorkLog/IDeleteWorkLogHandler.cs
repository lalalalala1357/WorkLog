using Modules.Common.Features;

namespace Modules.WorkLogs.Features.Features.DeleteWorkLog;

public interface IDeleteWorkLogHandler : IHandler
{
    Task<DeleteWorkLogResult> HandleAsync(
        Guid id,
        Guid employeeId,
        CancellationToken cancellationToken = default);
}
