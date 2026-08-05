using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.UpdateWorkLog;

public enum UpdateWorkLogError
{
    None,
    NotFound,
    NotDraft,
    InvalidShiftType
}

public sealed record UpdateWorkLogResult(
    WorkLogDetailResponse? WorkLog,
    UpdateWorkLogError Error);