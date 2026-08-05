using Modules.WorkLogs.Domains.WorkLogsAggregate;

namespace Modules.WorkLogs.Infrastructure.Repositories;
public class InMemoryWorkLogsRepository : IWorkLogsRepository
{
    private readonly List<WorkLog> _workLogs = [];
    private readonly object _lock = new();

    public Task<IEnumerable<WorkLog>> GetByEmployeeAndMonthAsync(
        Guid employeeId,
        int year,
        int month)
    {
        lock (_lock)
        {
            IEnumerable<WorkLog> result = _workLogs
                .Where(workLog =>
                    workLog.EmployeeId == employeeId &&
                    workLog.LogDate.Year == year &&
                    workLog.LogDate.Month == month)
                .ToList();

            return Task.FromResult(result);
        }
    }

    public Task<WorkLog?> GetByIdAsync(
        Guid id,
        Guid employeeId)
    {
        lock (_lock)
        {
            var result = _workLogs.FirstOrDefault(workLog =>
                    workLog.Id == id &&
                    workLog.EmployeeId == employeeId);

            return Task.FromResult(result);
        }
    }

    public Task<int> GetLatestSequenceByEmployeeAndDateAsync(
        Guid employeeId,
        DateOnly date)
    {
        lock (_lock)
        {
            var prefix = $"WD{date:yyyyMMdd}";

            var latestSequence = _workLogs
                .Where(workLog =>
                    workLog.EmployeeId == employeeId &&
                    workLog.LogNo.StartsWith(
                        prefix,
                        StringComparison.Ordinal))
                .Select(workLog =>
                    int.TryParse(
                        workLog.LogNo[prefix.Length..],
                        out var sequence)
                        ? sequence
                        : 0)
                .DefaultIfEmpty(0)
                .Max();
            return Task.FromResult(latestSequence);
        }
    }

    public Task AddAsync(WorkLog workLog)
    {
        lock (_lock)
        {
            _workLogs.Add(workLog);
        }
        return Task.CompletedTask;
    }

    public Task UpdateAsync(WorkLog workLog)
    {
        lock (_lock)
        {
            var index = _workLogs.FindIndex(existingWorkLog =>
                existingWorkLog.Id == workLog.Id);

            if (index >= 0)
            {
                _workLogs[index] = workLog;
            }
        }
        return Task.CompletedTask;
    }

    public Task UpdateStatusAsync(
        Guid id,
        string status,
        DateTime? submittedAt)
    {
        lock (_lock)
        {
            var workLog = _workLogs.FirstOrDefault(
                workLog => workLog.Id == id);

            if (workLog is not null)
            {
                workLog.Status = status;
                workLog.SubmittedAt = submittedAt;
            }
        }
        return Task.CompletedTask;
    }

    public Task DeleteAsync(WorkLog workLog)
    {
        lock (_lock)
        {
            _workLogs.Remove(workLog);
        }
        return Task.CompletedTask;
    }
}
