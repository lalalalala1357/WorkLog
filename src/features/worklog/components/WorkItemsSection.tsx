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
        <section className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">
                        工作細項
                    </h2>
                        
                    <p className="text-sm text-muted-foreground">
                        合計:{totalHours} 小時
                    </p>
                </div>
                <Button
                    type="button"
                    onClick={onAdd}
                    disabled={isReadOnly}
                >
                    ＋新增工作細項
                </Button>
            </div>

            {/*移到WorkItemRow 工作細項列表*/}
            <div className="space-y-4">
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
        </section>
    )
}