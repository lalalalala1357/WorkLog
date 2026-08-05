using Modules.WorkLogs.Features.Features.Shared;
using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Features.Features.GetWorkLogById;

public sealed class GetWorkLogByIdHandler(IWorkLogsRepository repository) : IGetWorkLogByIdHandler
{
    public async Task<WorkLogDetailResponse?> HandleAsync(
        Guid id,
        Guid employeeId,
        CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var workLog = await repository.GetByIdAsync(id, employeeId);
        return workLog is null ? null : WorkLogDetailResponse.From(workLog);
    }
}