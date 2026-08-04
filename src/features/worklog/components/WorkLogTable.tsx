import type { WorkLog } from "../types/WorkLog";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../../components/ui/table";

interface WorkLogTableProps
{
    workLogs: WorkLog[];
    onOpen?: (workLog: WorkLog) => void;
    onDelete?: (workLog: WorkLog) => void;
}

export function WorkLogTable({workLogs , onOpen , onDelete } : WorkLogTableProps)
{
    return (
        <div className="overflow-x-auto rounded-[8px] border bg-card">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>狀態</TableHead>
                        <TableHead>日期</TableHead>
                        <TableHead>工作摘要</TableHead>
                        <TableHead>總時數</TableHead>
                        <TableHead>操作</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {workLogs.map((log) => (
                        <TableRow key={log.id}>

                            <TableCell>
                                <Badge variant="outline"
                                        className={log.status === "DRAFT"
                                            ? "border-[#f59e0b] bg-[#f59e0b] text-white"
                                            : "border-[#1d9e75] bg-[#1d9e75] text-white"
                                        }
                                >
                                    {log.status === "DRAFT" ? "草稿" : "已送出"}
                                </Badge>
                            </TableCell>

                            <TableCell>
                                {log.logDate}
                            </TableCell>

                            <TableCell>
                                {log.summary ?? "尚未填寫"}
                            </TableCell>

                            <TableCell>
                                {log.totalHours == null ? "-" : `${log.totalHours} 小時`}
                            </TableCell>

                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Button
                                    type="button"
                                    size={"sm"}
                                    variant={"outline"}
                                    onClick={() => onOpen?.(log)}
                                >
                                    {log.status === "DRAFT" ? "編輯" : "查看"}
                                
                                </Button>

                                    {log.status === "DRAFT" && (
                                    <Button
                                    type="button"
                                    size={"sm"}
                                    variant={"destructive"}
                                    onClick={() => onDelete?.(log)}
                                >
                                    刪除
                                </Button>

                                )}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}