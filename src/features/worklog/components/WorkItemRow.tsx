import { Button } from "../../../components/ui/button";
import type { WorkItem } from "../types/WorkLog";

interface WorkItemRowProps
{
    item: WorkItem;
    isReadOnly: boolean;
    onChange:(
        id: string,
        changes: Partial<WorkItem>,
    ) => void;
    onRemove: (id: string) => void;
}

export function WorkItemRow({
    item,
    isReadOnly,
    onChange,
    onRemove,
}:WorkItemRowProps)
{
    return(
        <div
            key={item.id}
            className="grid gap-3 rounded-lg border p-4 md:grid-cols-12"
        >
            <input
                value={item.taskName}
                onChange={(event) => {
                    onChange(
                        item.id,
                        {
                            taskName:event.target.value,
                        },
                    );
                }}
                disabled={isReadOnly}
                placeholder="工作名稱"
                className="rounded-md border px-3 py-2 md:col-span-3"
            />

            <input
                value={item.description ?? ""}
                onChange={(event) => {
                    onChange(
                        item.id,
                        {
                            description:event.target.value,
                        },
                    );
                }}
                disabled={isReadOnly}
                placeholder="工作說明"
                className="rounded-md border px-3 py-2 md:col-span-4"
            />

            <input
                type="number"
                min="0"
                step="0.5"
                value={item.hours}
                onChange={(event) => {
                    onChange(
                        item.id,
                        {
                            hours:
                                Number(
                                    event.target.value,
                                ) || 0,
                        },
                    );
                }}
                disabled={isReadOnly}
                aria-label="工時"
                className="rounded-md border px-3 py-2 md:col-span-2"
            />

            <input
                type="number"
                min="0"
                max="100"
                value={item.progress}
                onChange={(event) => {
                    onChange(
                        item.id,
                        {
                            progress:
                                Number(event.target.value
                            ) || 0,
                        },
                    );
                }}
                disabled={isReadOnly}
                aria-label="進度"
                className="rounded-md border px-3 py-2 md:col-span-2"
            />

            <Button
                type="button"
                variant="destructive"
                disabled={isReadOnly}
                onClick={() => {
                    onRemove(item.id);
                }}
                className="md:col-span-1"
            >
                刪除
            </Button>
        </div>
    )
}