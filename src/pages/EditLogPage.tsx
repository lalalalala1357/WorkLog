import { useParams , useNavigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import type { WorkItem ,ApiResponse } from "../features/worklog/types/WorkLog";
import { EditLogActions } from "../features/worklog/components/EditLogActions";
import { BasicInfoSection } from "../features/worklog/components/BasicInfoSection";
import { WorkItemsSection } from "../features/worklog/components/WorkItemsSection";
import { SelfReadCheckbox } from "../features/worklog/components/SelfReadCheckbox";
import 
{ 
    useGetWorkLog,
    useGetShiftTypes,
    useUpdateWorkLog,
    useSubmitWorkLog,
} from "../features/worklog/hooks/useWorkLogs";

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

            <EditLogActions
                onCancel={() => {
                    navigate("/dashboard");
                }}

                onSaveDraft={handleSaveDraft}
                onSubmit={handleSubmit}
                isSaveDisabled={
                    isReadOnly ||
                    updateLog.isPending ||
                    !shiftTypeId
                }

                isSubmitDisabled={
                    isReadOnly ||
                    !selfRead ||
                    submitLog.isPending
                }

                isSaving={updateLog.isPending}
                isSubmitting={submitLog.isPending}
            />

            {submitErrorMessage && (
                <p
                    role="alert"
                    className="mt-3 text-sm text-red-600"
                >
                    {submitErrorMessage}
                </p>
            )}
            {/*移到BasicInfoSection 日期/班別*/}
            <BasicInfoSection
                logDate={data.logDate}
                shiftTypeId={shiftTypeId}
                shiftTypes={shiftTypes}
                isReadOnly={isReadOnly}
                onShiftTypeChange={setShiftTypeId}
            />

            {/*移到WorkItemsSection 工作細項 新增/合計/細項列表*/}
            <WorkItemsSection
                workItems={workItems}
                totalHours={totalHours}
                isReadOnly={isReadOnly}
                onAdd={handleAddWorkItem}
                onChange={handleWorkItemChange}
                onRemove={handleRemoveWorkItem}
            />

            <SelfReadCheckbox
                checked={selfRead}
                disabled={isReadOnly}
                onCheckedChange={setSelfRead}
            />
        </main>
    );
}