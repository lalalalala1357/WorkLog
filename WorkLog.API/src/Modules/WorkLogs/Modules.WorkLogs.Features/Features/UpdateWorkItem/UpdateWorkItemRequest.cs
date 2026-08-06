namespace Modules.WorkLogs.Features.Features.UpdateWorkItem;

public sealed record UpdateWorkItemRequest(
    string TaskName,
    string? Description,
    decimal Hours,
    short? Progress);
