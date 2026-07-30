import { useAuth } from "../features/authentication/hooks/useAuth";
import { Button } from "../components/ui/button";
import { useState } from "react";
import { useCreateLog , useDeleteLog , useGetMyLogs } from "../features/worklog/hooks/useWorkLogs";
import { WorkLogTable } from "../features/worklog/components/WorkLogTable";
import { useNavigate } from "react-router-dom";

export default function DashboardPage()
{
    const { logout } = useAuth();

    const navigate = useNavigate();
    const createLog = useCreateLog();
    const deleteLog = useDeleteLog();

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

    function handleCreateLog()
    {
        createLog.mutate(undefined, {
            onSuccess: (log) => {
                navigate(`/logs/${log.id}/edit`);
            },
        });
    }

    function handleDeleteLog(id: string)
    {
        const confirmed = window.confirm(
            "確定要刪除這筆草稿嗎?",
        );

        if(!confirmed)
        {
            return;
        }

        deleteLog.mutate(id);
    }

    if(isLoading)
    {
        return(
            <main className="p-6">
                <p>工作日誌載入中...</p>
            </main>
        );
    }

    if(error)
    {
        return(
            <main className="p-6">
                <p>工作日誌讀取失敗 請稍後再試</p>
            </main>
        );
    }

    return (
        <main className="p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">工作日誌</h1>
                
                <Button
                    type="button"
                    onClick={handleCreateLog}
                    disabled={createLog.isPending}
                >
                    {createLog.isPending
                        ? "建立中..."
                        : "＋新增今日日誌"}
                </Button>
                
                <Button variant = "outline" onClick={() => logout()}>
                    登出
                </Button>
            </div>

            <select
                aria-label="年份"
                value={year}
                onChange={(event) => {
                    setYear(Number(event.target.value));
                }}
                className="mt-6 rounded-md border bg-background px-3 py-2"
            >
                <option value={2025}>2025 年</option>
                <option value={2026}>2026 年</option>
                <option value={2027}>2027 年</option>
            </select>

            <select
                aria-label="月份"
                value={month}
                onChange={(event) => {
                    setMonth(Number(event.target.value));
                }}
                className="ml-2 rounded-md border bg-background px-3 py-2"
            >
                {Array.from({length:12},(_, index) => {
                    const value = index + 1;

                    return(
                        <option key={value} value={value}>
                            {value} 月
                        </option>
                    );
                })}
            </select>

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