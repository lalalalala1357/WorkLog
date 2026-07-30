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
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>日期</TableHead>
                        <TableHead>日誌編號</TableHead>
                        <TableHead>工作摘要</TableHead>
                        <TableHead>工時</TableHead>
                        <TableHead>狀態</TableHead>
                        <TableHead>操作</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {workLogs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>
                                {log.logDate}
                            </TableCell>

                            <TableCell>
                                {log.logNo}
                            </TableCell>

                            <TableCell>
                                {log.summary ?? "尚未填寫"}
                            </TableCell>

                            <TableCell>
                                {log.totalHours == null ? "-" : `${log.totalHours} 小時`}
                            </TableCell>

                            <TableCell>
                                <Badge variant={log.status === "DRAFT" ? "secondary" : "outline"}>
                                    {log.status === "DRAFT" ? "草稿" : "已送出"}
                                </Badge>
                            </TableCell>

                            <TableCell>

                                <Button
                                    type="button"
                                    size={"sm"}
                                    variant={"outline"}
                                    onClick={() => onOpen?.(log)}
                                >
                                    {log.status === "DRAFT" ? "編輯" : "檢視"}
                                
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}