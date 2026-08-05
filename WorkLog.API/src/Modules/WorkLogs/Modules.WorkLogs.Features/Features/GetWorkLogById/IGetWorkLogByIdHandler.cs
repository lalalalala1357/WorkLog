using Modules.WorkLogs.Features.Features.Shared;
using Modules.Common.Features;

namespace Modules.WorkLogs.Features.Features.GetWorkLogById;

public interface IGetWorkLogByIdHandler : IHandler
{
    Task<WorkLogDetailResponse?> HandleAsync(
        Guid id,
        Guid employeeId,
        CancellationToken cancellationToken = default);
}
