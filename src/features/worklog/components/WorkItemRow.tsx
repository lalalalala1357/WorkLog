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
            className="grid gap-3 rounded-[8px] border p-4 md:grid-cols-12"
        >
            <span className="text-sm font-medium md:hidden">
                工作摘要<span className="ml-1 text-destructive">*</span>
            </span>
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
                //required 必填
                required
                placeholder="工作摘要"
                className="rounded-[4px] border px-3 py-2 md:col-span-7"
            />

            <span className="text-sm font-medium md:hidden">
                時數<span className="ml-1 text-destructive">*</span>
            </span>

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
                required
                aria-label="時數"
                className="rounded-[4px] border px-3 py-2 md:col-span-2"
            />

            <span className="text-sm font-medium md:hidden">
                完成度（%）
            </span>

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
                className="rounded-[4px] border px-3 py-2 md:col-span-2"
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