using Modules.Common.Features;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.CreateWorkLog;

public interface ICreateWorkLogHandler : IHandler
{
    Task<WorkLogDetailResponse> HandleAsync(
        Guid employeeId,
        CancellationToken cancellationToken = default);
}
