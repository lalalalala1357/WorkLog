using Modules.WorkLogs.Features.Features.Shared;

namespace Modules.WorkLogs.Features.Features.UpdateWorkItem;

public sealed record UpdateWorkItemResponse(
    WorkItemResponse Item,
    decimal LogTotalHours);