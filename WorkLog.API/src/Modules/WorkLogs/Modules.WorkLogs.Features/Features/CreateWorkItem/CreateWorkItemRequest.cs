namespace Modules.WorkLogs.Features.Features.CreateWorkItem;

public sealed record CreateWorkItemRequest(
    string TaskName,
    string? Description,
    decimal Hours,
    short? Progress
);
