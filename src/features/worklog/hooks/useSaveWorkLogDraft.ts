import { useUpdateWorkLog } from "./useWorkLogs";
import {
    useUpdateWorkItem,
    useCreateWorkItem,
    useDeleteWorkItem,
} from "./useWorkItems";

import type {
    WorkItem,
    WorkLogDetail,
} from "../types/WorkLog";

export interface SaveWorkLogDraftParams
{
    logId: string | undefined;
    logDate: string;
    workLog: WorkLogDetail | undefined;
    shiftTypeId: string;
    selfRead: boolean;
    workItems: WorkItem[];
    deletedWorkItemIds: string[];
    onWorkItemDeleted: (itemId: string) => void;
}

export function useSaveWorkLogDraft()
{
    const updateLog = useUpdateWorkLog();
    const updateWorkItemMutation = useUpdateWorkItem();
    const createWorkItemMutation = useCreateWorkItem();
    const deleteWorkItemMutation = useDeleteWorkItem();

    function saveDraft(params: SaveWorkLogDraftParams)
    {
        if(
            !params.logId ||
            !params.workLog ||
            !params.shiftTypeId
        )
        {
            return;
        }

        const logId = params.logId;
        const workLog = params.workLog;

        params.deletedWorkItemIds.forEach((itemId) => {
            deleteWorkItemMutation.mutate({
                logId,
                itemId,
            },
            {
                onSuccess: () => {
                    params.onWorkItemDeleted(itemId);
                },
            },
        );
    });

    workLog.workItems.forEach((originalItem) => {
            const currentItem = params.workItems.find(
                (item) => item.id === originalItem.id,
            );

            if(!currentItem)
            {
                return;
            }

            updateWorkItemMutation.mutate({
                logId,
                itemId: currentItem.id,
                request:{
                    taskName: currentItem.taskName,
                    description: currentItem.description,
                    hours: currentItem.hours,
                    progress: currentItem.progress,
                },
            });
        });

        const originalItemIds = new Set(
            workLog.workItems.map((item) => item.id),
        );

        params.workItems
            .filter((item) => !originalItemIds.has(item.id))
            .forEach((item) => {
                createWorkItemMutation.mutate({
                    logId,
                    request: {
                        taskName: item.taskName,
                        description: item.description,
                        hours: item.hours,
                        progress: item.progress,
                    },
                });
            });

            updateLog.mutate({
            id: logId,
            request:{
                logDate:params.logDate,
                shiftTypeId: params.shiftTypeId,
                selfRead: params.selfRead,
            },
        });
    
    }

    const isUpdatingLog = updateLog.isPending;

    const isSaving =
        isUpdatingLog ||
        updateWorkItemMutation.isPending ||
        createWorkItemMutation.isPending ||
        deleteWorkItemMutation.isPending;

    return {
        isSaving,
        isUpdatingLog,
        saveDraft,
    };
}