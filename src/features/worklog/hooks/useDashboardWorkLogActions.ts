import { useNavigate } from "react-router-dom";

import {
    useCreateLog,
    useDeleteLog
} from "./useWorkLogs";

export function useDashboardWorkLogActions()
{
    const createLog = useCreateLog();
    const deleteLog = useDeleteLog();
    const navigate = useNavigate();

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
            "確定要刪除這筆草稿嗎？",
        );

        if(!confirmed)
        {
            return;
        }

        deleteLog.mutate(id);
    }

    const isCreating = createLog.isPending;

    return {
        handleCreateLog,
        handleDeleteLog,
        isCreating,
    };
}