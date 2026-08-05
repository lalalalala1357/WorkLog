using Modules.WorkLogs.Domains.WorkLogsAggregate;
using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.UpdateWorkLog;

public sealed class UpdateWorkLogHandler(
    IWorkLogsRepository repository) : IUpdateWorkLogHandler
{
    public async Task<UpdateWorkLogResult> HandleAsync(
        Guid id,
        Guid employeeId,
        UpdateWorkLogRequest request,
        CancellationToken cancellationToken = default)

    {
        cancellationToken.ThrowIfCancellationRequested();

        var workLog = await repository.GetByIdAsync(id, employeeId);

        if (workLog is null)
            return new UpdateWorkLogResult(null, UpdateWorkLogError.NotFound);

        if (!string.Equals(
            workLog.Status,
            "DRAFT",
            StringComparison.Ordinal))

        {
            return new UpdateWorkLogResult(null, UpdateWorkLogError.NotDraft);
        }

        var shiftType = DevelopmentShiftTypes.Find(request.ShiftTypeId);

        if (shiftType is null)
        {
            return new UpdateWorkLogResult(
                null,
                UpdateWorkLogError.InvalidShiftType);
        }

        workLog.LogDate = request.LogDate;
        workLog.ShiftTypeId = request.ShiftTypeId;
        workLog.SelfRead = request.SelfRead;
        workLog.UpdatedAt = DateTime.UtcNow;

        await repository.UpdateAsync(workLog);

        return new UpdateWorkLogResult(
            WorkLogDetailResponse.From(workLog , shiftType),
            UpdateWorkLogError.None);
    }
}
