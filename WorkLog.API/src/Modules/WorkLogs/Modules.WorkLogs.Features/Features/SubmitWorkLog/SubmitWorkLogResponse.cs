namespace Modules.WorkLogs.Features.Features.SubmitWorkLog;

public sealed record SubmitWorkLogResponse(
    Guid Id,
    string LogNo,
    string Status,
    DateTime SubmittedAt);