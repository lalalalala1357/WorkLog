namespace Modules.WorkLogs.Features.Features.UpdateWorkLog;

public sealed record UpdateWorkLogRequest(
    DateOnly LogDate,
    Guid ShiftTypeId,
    bool SelfRead);
