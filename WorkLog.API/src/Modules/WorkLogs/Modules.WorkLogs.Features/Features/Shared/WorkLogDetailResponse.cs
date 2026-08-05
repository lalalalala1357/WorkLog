using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Features.Features.Shared;

public sealed record ShiftTypeResponse(
    Guid Id,
    string Name,
    string? Description);

public sealed record WorkItemResponse(
    Guid Id,
    short Seq,
    string TaskName,
    string? Description,
    decimal Hours,
    short? Progress);

public sealed record WorkLogDetailResponse(
    Guid Id,
    string LogNo,
    DateOnly LogDate,
    ShiftTypeResponse? ShiftType,
    string Status,
    bool SelfRead,
    decimal? TotalHours,
    DateTime? SubmittedAt,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<WorkItemResponse> WorkItems)
{
    public static WorkLogDetailResponse From(
        WorkLog workLog,
        ShiftTypeResponse? shiftType = null)
    {
        shiftType ??= workLog.ShiftTypeId is Guid shiftTypeId
            ? DevelopmentShiftTypes.Find(shiftTypeId)
            : null;

        return new WorkLogDetailResponse(
            workLog.Id,
            workLog.LogNo,
            workLog.LogDate,
            shiftType,
            workLog.Status,
            workLog.SelfRead,
            workLog.TotalHours,
            workLog.SubmittedAt,
            workLog.CreatedAt,
            workLog.UpdatedAt,
            workLog.WorkItems
                .OrderBy(workItem => workItem.Seq)
                .Select(workItem => new WorkItemResponse(
                    workItem.Id,
                    workItem.Seq,
                    workItem.TaskName,
                    workItem.Description,
                    workItem.Hours,
                    workItem.Progress))
                .ToList());
    }
}