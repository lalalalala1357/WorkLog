import type { WorkLog } from "../types/WorkLog";

interface WorkLogTableProps
{
    workLogs: WorkLog[];
}

export function WorkLogTable({workLogs} : WorkLogTableProps)
{
    return (
        <div>
            {workLogs.map((log) => (
                <div key={log.id}>
                    <p>{log.logNo}</p>
                    <p>{log.summary}</p>
                </div>
            ))}
        </div>
    );
}