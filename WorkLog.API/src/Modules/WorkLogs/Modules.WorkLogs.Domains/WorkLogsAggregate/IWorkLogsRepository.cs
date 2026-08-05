using Modules.Common.Domains.SeedWork;

namespace Modules.WorkLogs.Domains.WorkLogsAggregate;

public interface IWorkLogsRepository : IRepository<WorkLog>
{
    Task<IEnumerable<WorkLog>> GetByEmployeeAndMonthAsync(
        Guid employeeId,
        int year,
        int month);

    Task<WorkLog?> GetByIdAsync(
        Guid id,
        Guid employeeId);

    Task<int> GetLatestSequenceByEmployeeAndDateAsync(
        Guid employeeId,
        DateOnly date);

    Task AddAsync(WorkLog workLog);

    Task DeleteAsync(WorkLog workLog);

    Task UpdateAsync(WorkLog workLog);

    Task UpdateStatusAsync(
        Guid id,
        string status,
        DateTime? submittedAt);
}