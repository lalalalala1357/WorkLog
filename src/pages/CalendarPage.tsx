import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { DashboardFilters } from "../features/worklog/components/DashboardFilters";
import { useGetMyLogs } from "../features/worklog/hooks/useWorkLogs";
import { getCalendarDays } from "../features/worklog/utils/getCalendarDays";
import type { WorkLog } from "../features/worklog/types/WorkLog";

export default function CalendarPage()
{
    const navigate = useNavigate();

    const today = new Date();
    const [year , setYear] = useState(
        today.getFullYear(),
    );
    const [month , setMonth] = useState(
        today.getMonth() + 1,
    );

    const [
        selectedWorkLog,
        setSelectedWorkLog,
    ] = useState<WorkLog | null>(null);
    const {
        data: workLogs = [],
        isLoading,
        error,
    } = useGetMyLogs(year , month);

    const calendarDays = getCalendarDays(year , month);
    function handleDayClick(day: number | null)
    {
        if(day === null)
        {
            return;
        }

        const workLog = workLogs.find(
            (item) =>
                Number(item.logDate.slice(8 , 10)) === day,
        );

        setSelectedWorkLog(workLog ?? null);
    }

    return (
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <header className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">
                    工作日誌月曆
                </h1>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                >
                    返回總覽
                </Button>
            </header>

            <div className="mt-6">
                <DashboardFilters
                    year={year}
                    month={month}
                    onYearChange={setYear}
                    onMonthChange={setMonth}
                />
            </div>
                {isLoading && (
                    <p className="mt-6 text-muted-foreground">
                        工作日誌讀取中...
                    </p>
                )}

                {error && (
                    <p className="mt-6 text-destructive">
                        工作日誌讀取失敗 請稍後再試
                    </p>
                )}

                {!isLoading && !error && (
                    <div className="relative mt-6 grid grid-cols-7 border-b border-l">
                        {["日","一","二","三","四","五","六"].map(
                            (weekday) => (
                                <div
                                    key={weekday}
                                    className="border-r border-t p-2 text-center text-sm font-medium text-muted-foreground"
                                >
                                    {weekday}
                                </div>
                            ),
                        )}
                        {calendarDays.map((day , index) => (
                            <button
                                key={`${year}-${month}-${index}`}
                                type="button"
                                disabled={day === null}
                                onClick={() => handleDayClick(day)}
                                className="min-h-24 border-r border-t p-2 text-left disabled:cursor-default"
                            >
                                {day !== null && (
                                    <span className="text-sm font-medium">
                                        {day}
                                    </span>
                                )}

                                {day !== null && workLogs.some(
                                    (workLog) =>
                                        workLog.status === "DRAFT" &&
                                        Number(
                                            workLog.logDate.slice(8 , 10),
                                        ) === day,
                                    ) && (
                                        <div
                                            className="mt-2 size-2 rounded-full bg-orange-500"
                                            aria-label="草稿"
                                        />
                                )}

                                {day !== null && workLogs.some(
                                    (workLog) =>
                                        workLog.status === "SUBMITTED" &&
                                        Number(
                                            workLog.logDate.slice(8 , 10),
                                        ) === day,
                                    ) && (
                                        <div
                                            className="mt-2 size-2 rounded-full bg-green-600"
                                            aria-label="已送出"
                                        />
                                )}
                            </button>
                        ))}
                        {selectedWorkLog && (
                            <div className="absolute right-4 top-14 z-10 w-72 rounded-xl border bg-card p-4 shadow-lg">
                                <p className="font-semibold">
                                    {selectedWorkLog.logDate}
                                </p>

                                <p className="mt-2 text-sm text-muted-foreground">
                                    {selectedWorkLog.summary ?? "尚無工作摘要"}
                                </p>

                                <div className="mt-4 flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedWorkLog(null)}
                                    >
                                        關閉
                                    </Button>

                                    <Button
                                        type="button"
                                        size="sm"
                                        onClick={() => navigate(
                                            `/logs/${selectedWorkLog.id}/edit`,
                                        )}
                                    >
                                        {selectedWorkLog.status === "DRAFT"
                                            ? "編輯"
                                            : "查看"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
        </main>
    );
}