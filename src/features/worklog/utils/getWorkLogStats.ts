import type { WorkLog , WorkLogStats } from "../types/WorkLog";
import { getWorkdayCount } from './getWorkdayCount';

export function getWorkLogStats(
    workLogs: WorkLog[],
    year: number,
    month: number,
): WorkLogStats
{
    const workdayCount = getWorkdayCount(year , month);
    const filledDates = new Set(
        workLogs.map((workLog) => workLog.logDate),
    );

    return {
        completionRate: workdayCount === 0
            ? 0
            : Math.round(filledDates.size / workdayCount * 100),
        draftCount: workLogs.filter(
            (workLog) => workLog.status === "DRAFT",
        ).length,
        submittedCount: workLogs.filter(
            (workLog) => workLog.status === "SUBMITTED",
        ).length,
    };
}