namespace Modules.WorkLogs.Features.Features.DeleteWorkItem;

public sealed record DeleteWorkItemResult(
    DeleteWorkItemResponse? Response,
    DeleteWorkItemError Error);

public enum DeleteWorkItemError
{
    None,
    NotFound,
    NotDraft
}
