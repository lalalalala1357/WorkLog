import { useEffect , useState } from "react";
import type { WorkItem } from "../types/WorkLog";

export function useEditLogItems(
    originalWorkItems: WorkItem[] | undefined,
)
{
    const [workItems , setWorkItems] = useState<WorkItem[]>([]);
    const [deletedWorkItemIds , setDeletedWorkItemIds] = useState<string[]>([]);

    function handleAddWorkItem()
    {
        setWorkItems((currentItems) => [
            ...currentItems,
            {
                id:crypto.randomUUID(),
                seq:currentItems.length + 1,
                taskName:"",
                description:null,
                hours:0,
                progress:0,
            },
        ]);
    }

    function handleWorkItemChange(
        itemId: string,
        changes: Partial<WorkItem>,
    )
    {
        setWorkItems((currentItems) => 
            currentItems.map((item) => 
                item.id === itemId
                    ? {...item,...changes}
                    : item,
            ),
        );
    }

    function handleRemoveWorkItem(itemId: string)
    {
        if(originalWorkItems?.some((item) => item.id === itemId))
        {
            setDeletedWorkItemIds((currentIds) =>
            currentIds.includes(itemId)
                ? currentIds
                : [...currentIds , itemId],
            );
        }
        setWorkItems((currentItems) =>
            currentItems
                .filter((item) => item.id !== itemId)
                .map((item , index) => ({
                    ...item,
                    seq: index + 1
                })),
            );
    }

    function clearDeletedWorkItemId(itemId: string)
    {
        setDeletedWorkItemIds((currentIds) =>
            currentIds.filter((currentId) => currentId !== itemId)
        );
    }

    const totalHours = workItems.reduce(
        (total , item) => total + item.hours,0,
    );

    useEffect(() => {
        if(originalWorkItems)
        {
            setWorkItems(originalWorkItems);
        }
    },[originalWorkItems]);

    return {
        workItems,
        deletedWorkItemIds,
        totalHours,
        handleAddWorkItem,
        handleRemoveWorkItem,
        handleWorkItemChange,
        clearDeletedWorkItemId,
    };
}