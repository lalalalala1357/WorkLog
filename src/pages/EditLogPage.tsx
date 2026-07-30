import { useParams , useNavigate } from "react-router-dom";
import axios from "axios";
import 
{ 
    useGetWorkLog,
    useGetShiftTypes,
    useUpdateWorkLog,
    useSubmitWorkLog,
} from "../features/worklog/hooks/useWorkLogs";
import { useEffect, useState } from "react";
import type { WorkItem ,ApiResponse } from "../features/worklog/types/WorkLog";
import { Button } from "../components/ui/button";

export default function EditLogPage()
{
    const {id} = useParams<{id: string;}>();
    const {
        data,
        isLoading,
        error,
    } = useGetWorkLog(id);

    const {
        data: shiftTypes =[],
        isLoading: isShiftTypesLoading,
        error: shiftTypesError,
    } = useGetShiftTypes();

    const [shiftTypeId , setShiftTypeId] = useState("");
    const [workItems , setWorkItems] = useState<WorkItem[]>([]);
    const [selfRead , setSelfRead] = useState(false);
    const navigate = useNavigate();
    const updateLog = useUpdateWorkLog();
    const submitLog = useSubmitWorkLog();

    useEffect(() => {
        if(data?.shiftType?.id)
        {
            setShiftTypeId(data.shiftType.id);
        }

        if(data)
        {
            setWorkItems(data.workItems);
            setSelfRead(data.selfRead);
        }
    },[data]);

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
        setWorkItems((currentItems) =>
            currentItems
                .filter((item) => item.id !== itemId)
                .map((item , index) => ({
                    ...item,
                    seq: index + 1
                })),
            );
    }

    const totalHours = workItems.reduce(
        (total , item) => total + item.hours,0,
    );

    if(isLoading || isShiftTypesLoading)
    {
        return(
            <main className="p-6">
                <p>工作日誌載入中...</p>
            </main>
        );
    }

    function handleSaveDraft()
    {
        if(!id || !data || !shiftTypeId)
        {
            return;
        }

        updateLog.mutate({
            id,
            request:{
                logDate:data.logDate,
                shiftTypeId,
                selfRead,
            },
        });
    }

    function handleSubmit()
    {
        if(!id || !selfRead)
        {
            return;
        }
        submitLog.mutate(id);
    }

    if(error || !data || shiftTypesError)
    {
        return(
            <main className="p-6">
                <p>工作日誌讀取失敗 請稍後再試</p>
            </main>
        )
    }

    const isReadOnly = data.status === "SUBMITTED";

    const submitErrorMessage =
        axios.isAxiosError<ApiResponse<unknown>>(submitLog.error)
            ? submitLog.error.response?.data.message
            : submitLog.isError
                ? "送出失敗 請稍後再試"
                : null;

    return (
        <main className="p-6">
            <h1 className="text-2xl font-semibold">
                編輯工作日誌
            </h1>

            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        navigate("/dashboard");
                    }}
                >
                    取消
                </Button>

                <Button
                    type="button"
                    variant="secondary"
                    onClick={handleSaveDraft}
                    disabled={
                        isReadOnly ||
                        updateLog.isPending ||
                        !shiftTypeId
                    }
                >
                    {updateLog.isPending
                        ? "儲存中..."
                        : "儲存草稿"}
                </Button>

                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={
                        isReadOnly ||
                        !selfRead ||
                        submitLog.isPending
                    }
                >
                    {submitLog.isPending ? "送出中..." : "送出"}
                </Button>
            </div>

            {submitErrorMessage && (
                <p
                    role="alert"
                    className="mt-3 text-sm text-red-600"
                >
                    {submitErrorMessage}
                </p>
            )}

            <section className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                    <span className="text-sm font-medium">
                        日期
                    </span>

                    <input
                        type="date"
                        value={data.logDate}
                        readOnly
                        className="rounded-md border bg-muted px-3 py-2"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium">
                        班別
                    </span>

                    <select
                        value={shiftTypeId}
                        onChange={(event) => {
                            setShiftTypeId(event.target.value);
                        }}
                        disabled={isReadOnly}
                        className="rounded-md border bg-background px-3 py-2"
                    >
                        <option value="">
                            請選擇班別
                        </option>

                        {shiftTypes.map((shiftType) => (
                            <option
                                key={shiftType.id}
                                value={shiftType.id}
                            >
                                {shiftType.name}
                            </option> 
                        ))}
                    </select>
                </label>
            </section>

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
                        onClick={handleAddWorkItem}
                        disabled={isReadOnly}
                    >
                        ＋新增工作細項
                    </Button>
                </div>

                <div className="space-y-4">
                    {workItems.map((item) => (
                        <div
                            key={item.id}
                            className="grid gap-3 rounded-lg border p-4 md:grid-cols-12"
                        >
                            <input
                                value={item.taskName}
                                onChange={(event) => {
                                    handleWorkItemChange(
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
                                    handleWorkItemChange(
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
                                    handleWorkItemChange(
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
                                    handleWorkItemChange(
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
                                    handleRemoveWorkItem(item.id);
                                }}
                                className="md:col-span-1"
                            >
                                刪除
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            <label className="mt-6 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={selfRead}
                    disabled={isReadOnly}
                    onChange={(event) => {
                        setSelfRead(event.target.checked)
                    }}
                />

                <span>本人已閱讀</span>
            </label>
        </main>
    );
}