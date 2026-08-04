import { Button } from "../../../components/ui/button";
import type { WorkItem } from "../types/WorkLog";
import { WorkItemRow } from "./WorkItemRow";

interface WorkItemsSectionProps
{
    workItems: WorkItem[];
    totalHours: number;
    isReadOnly: boolean;
    onAdd: () => void;
    onChange: (
        id: string,
        changes: Partial<WorkItem>,
    ) => void;
    onRemove: (id: string) => void;
}

export function WorkItemsSection({
    workItems,
    totalHours,
    isReadOnly,
    onAdd,
    onChange,
    onRemove,
}:WorkItemsSectionProps)
{
    return (
        <section className="mt-8 space-y-4 rounded-[8px] border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        工作細項內容
                    </h2>
                </div>
                <Button
                    type="button"
                    onClick={onAdd}
                    disabled={isReadOnly}
                >
                    ＋新增項目
                </Button>
            </div>

            {workItems.length === 0 ? (
                <button
                    type="button"
                    onClick={onAdd}
                    disabled={isReadOnly}
                    className="w-full rounded-[8px] border border-dashed p-8 text-sm text-muted-foreground disabled:cursor-not-allowed"
                    >
                        目前沒有工作項目 · 點此新增第一項工作
                    </button>
            ) : (
                <div className="space-y-4">

                    <div className="hidden grid-cols-12 gap-3 px-4 text-sm font-medium text-muted-foreground md:grid">
                        <span className="col-span-7">
                            工作摘要<span className="ml-1 text-destructive">*</span>
                        </span>
                        <span className="col-span-2">
                            時數<span className="ml-1 text-destructive">*</span>
                        </span>
                        <span className="col-span-2">完成度（%）</span>
                        <span className="col-span-1">操作</span>
                    </div>
                    {workItems.map((item) => (
                        <WorkItemRow
                            key={item.id}
                            item={item}
                            isReadOnly={isReadOnly}
                            onChange={onChange}
                            onRemove={onRemove}
                        />
                    ))}
                </div>

            )}

            <p className="text-sm text-muted-foreground">
                合計：{totalHours} 小時
            </p>
        </section>
    )
}