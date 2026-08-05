namespace Modules.WorkLogs.Features.Features.SubmitWorkLog;

public sealed record SubmitWorkLogResult(
    SubmitWorkLogResponse? WorkLog,
    SubmitWorkLogError Error);

public enum SubmitWorkLogError
{
    None,
    NotFound,
    AlreadySubmitted
}
