namespace Modules.WorkLogs.Features.Features.CreateWorkItem;

public sealed record CreateWorkItemResult(
    CreateWorkItemResponse? Response,
    CreateWorkItemError Error);

public enum CreateWorkItemError
{
    None,
    NotFound,
    NotDraft
}
