using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.CreateWorkItem;

public sealed record CreateWorkItemResponse(
    WorkItemResponse Item,
    decimal LogTotalHours);
