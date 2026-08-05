namespace Modules.WorkLogs.Features.Features.DeleteWorkLog;

public sealed record DeleteWorkLogResult(DeleteWorkLogError Error);

public enum DeleteWorkLogError
{
    None,
    NotFound,
    NotDraft
}
