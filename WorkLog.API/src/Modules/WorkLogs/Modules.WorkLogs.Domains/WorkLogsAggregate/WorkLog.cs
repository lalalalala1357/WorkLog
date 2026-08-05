using Modules.Common.Domains.SeedWork;

namespace Modules.WorkLogs.Domains.WorkLogsAggregate;

public class WorkLog : Entity, IAggregateRoot
{
    public WorkLog()
    {
        var now = DateTime.UtcNow;
        Id = Guid.NewGuid();
        CreatedAt = now;
        UpdatedAt = now;
    }
    public string LogNo { get; set; } = string.Empty;
    public Guid EmployeeId { get; set; }
    public DateOnly LogDate { get; set; }
    public Guid? ShiftTypeId { get; set; }
    public decimal? TotalHours { get; set; }
    public string Status { get; set; } = "DRAFT";
    public bool SelfRead { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public List<WorkItem> WorkItems { get; set; } = [];
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class WorkItem
{
    public Guid Id { get; set; }
    public short Seq { get; set; }
    public string TaskName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Hours { get; set; }
    public short? Progress { get; set; }
}