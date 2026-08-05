using Modules.Common.Features;

namespace Modules.WorkLogs.Features.Features.SubmitWorkLog;

public interface ISubmitWorkLogHandler : IHandler
{
    Task<SubmitWorkLogResult> HandleAsync(
        Guid id,
        Guid employeeId,
        CancellationToken cancellationToken = default);
}
