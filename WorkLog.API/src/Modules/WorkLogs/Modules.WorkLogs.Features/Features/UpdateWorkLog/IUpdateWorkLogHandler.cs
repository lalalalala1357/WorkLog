using Modules.Common.Features;

namespace Modules.WorkLogs.Features.Features.UpdateWorkLog;

public interface IUpdateWorkLogHandler : IHandler
{
    Task<UpdateWorkLogResult> HandleAsync(
        Guid id,
        Guid employeeId,
        UpdateWorkLogRequest request,
        CancellationToken cancellationToken = default);
}
