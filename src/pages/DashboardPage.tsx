import { useAuth } from "../features/authentication/hooks/useAuth";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { useGetMyLogs } from "../features/worklog/hooks/useWorkLogs";
import { WorkLogTable } from "../features/worklog/components/WorkLogTable";
import { useNavigate } from "react-router-dom";
import { DashboardHeader } from "../features/worklog/components/DashboardHeader";
import { DashboardFilters } from "../features/worklog/components/DashboardFilters";
import { useDashboardWorkLogActions } from "../features/worklog/hooks/useDashboardWorkLogActions";
export default function DashboardPage()
{
    const { logout } = useAuth();

    const navigate = useNavigate();
    const {
        handleCreateLog,
        handleDeleteLog,
        isCreating,
    } = useDashboardWorkLogActions();

    const today = new Date();
    const [year , setYear] = useState(
        today.getFullYear(),
    );

    const [month , setMonth] = useState(
        today.getMonth() + 1,
    );

    const{
        data ,
        isLoading ,
        error ,
    }=useGetMyLogs(year , month);

    if(isLoading)
    {
        return(
            <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
                <p>工作日誌載入中...</p>
            </main>
        );
    }

    if(error)
    {
        return(
            <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
                <p>工作日誌讀取失敗 請稍後再試</p>
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <DashboardHeader onLogout={logout} />

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <DashboardFilters
                    year={year}
                    month={month}
                    onYearChange={setYear}
                    onMonthChange={setMonth}
                />
                <Button
                    type="button"
                    onClick={handleCreateLog}
                    disabled={isCreating}
                >
                    {isCreating
                        ? "建立中..."
                        : "＋新增今日日誌"}
                </Button>
            </div>

            {data?.length === 0 && (
                <p className="mt-6 text-muted-foreground">
                    這個月份目前沒有工作日誌
                </p>
            )}
            
            {data && data.length > 0 && (
                <div className="mt-6">
                    <WorkLogTable
                        workLogs={data}
                        onOpen={(log) => {
                            navigate(`/logs/${log.id}/edit`);
                        }}

                        onDelete={(log) => {
                            handleDeleteLog(log.id)
                        }}
                    />
                </div>
            )}
        </main>
    );
}