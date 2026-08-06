namespace Modules.WorkLogs.Features.Features.UpdateWorkItem;

public sealed record UpdateWorkItemResult(
    UpdateWorkItemResponse? Response,
    UpdateWorkItemError Error);

public enum UpdateWorkItemError
{
    None,
    NotFound,
    NotDraft
}
