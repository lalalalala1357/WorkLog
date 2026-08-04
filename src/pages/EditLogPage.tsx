import { useParams , useNavigate } from "react-router-dom";
import { EditLogActions } from "../features/worklog/components/EditLogActions";
import { BasicInfoSection } from "../features/worklog/components/BasicInfoSection";
import { WorkItemsSection } from "../features/worklog/components/WorkItemsSection";
import { SelfReadCheckbox } from '../features/worklog/components/SelfReadCheckbox';
import { useAuth } from "../features/authentication/hooks/useAuth";
import { useCurrentEmployee } from "../features/authentication/hooks/useCurrentEmployee";
import { useEditLogItems } from "../features/worklog/hooks/useEditLogItems";
import { useEditLogForm } from "../features/worklog/hooks/useEditLogForm";
import { useSaveWorkLogDraft } from "../features/worklog/hooks/useSaveWorkLogDraft";
import { useSubmitWorkLogAction } from "../features/worklog/hooks/useSubmitWorkLogAction";
import { useUploadAttachment } from "../features/worklog/hooks/useAttachments";
import { AttachmentsSection } from "@/features/worklog/components/AttachmentsSection";
import { useGetWorkLog , useGetShiftTypes } from "../features/worklog/hooks/useWorkLogs";

export default function EditLogPage()
{
    const {
        employeeNo,
        employeeName,
    } = useAuth();

    const {data: currentEmployee,} = useCurrentEmployee();

    const {id} = useParams<{id: string;}>();
    const {
        data,
        isLoading,
        error,
    } = useGetWorkLog(id);

    const {
        workItems,
        deletedWorkItemIds,
        clearDeletedWorkItemId,
        totalHours,
        handleAddWorkItem,
        handleWorkItemChange,
        handleRemoveWorkItem,
    } = useEditLogItems(data?.workItems);

    const {
        data: shiftTypes =[],
        isLoading: isShiftTypesLoading,
        error: shiftTypesError,
    } = useGetShiftTypes();

    const {
        logDate,
        setLogDate,
        shiftTypeId,
        setShiftTypeId,
        selfRead,
        setSelfRead,
    } = useEditLogForm(data);

    const navigate = useNavigate();
    const 
    {
        handleSubmit,
        isSubmitting,
        submitErrorMessage,
    } = useSubmitWorkLogAction(id , selfRead);

    const {
        isSaving,
        isUpdatingLog,
        saveDraft,
    } = useSaveWorkLogDraft();

    const uploadAttachmentMutation = useUploadAttachment();

    if(isLoading || isShiftTypesLoading)
    {
        return(
            <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
                <p>工作日誌載入中...</p>
            </main>
        );
    }

    if(error || !data || shiftTypesError)
    {
        return(
            <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
                <p>工作日誌讀取失敗 請稍後再試</p>
            </main>
        )
    }

    const isReadOnly = data.status === "SUBMITTED";

    return (
        <main className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-semibold">
                    編輯工作日誌
                </h1>

                <EditLogActions
                    onCancel={() => {
                        navigate("/dashboard");
                    }}

                    onSaveDraft={() => {
                        saveDraft({
                            logId: id,
                            workLog: data,
                            logDate,
                            shiftTypeId,
                            selfRead,
                            workItems,
                            deletedWorkItemIds,
                            onWorkItemDeleted: clearDeletedWorkItemId,
                        });
                    }}
                    onSubmit={handleSubmit}
                    isSaveDisabled={
                        isReadOnly ||
                        isUpdatingLog ||
                        !shiftTypeId
                    }

                    isSubmitDisabled={
                        isReadOnly ||
                        !selfRead ||
                        isSubmitting
                    }

                    isSaving={isSaving}
                    isSubmitting={isSubmitting}
                />
            </div>

            {submitErrorMessage && (
                <p
                    role="alert"
                    className="mt-3 text-sm text-red-600"
                >
                    {submitErrorMessage}
                </p>
            )}

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 [&>section]:mt-0">
                    {/*移到BasicInfoSection 日期/班別*/}
                    <BasicInfoSection
                        logNo={data.logNo}
                        employeeNo={currentEmployee?.employeeNo ?? employeeNo}
                        employeeName={currentEmployee?.name ?? employeeName}
                        logDate={logDate}
                        onLogDateChange={setLogDate}
                        shiftTypeId={shiftTypeId}
                        shiftTypes={shiftTypes}
                        isReadOnly={isReadOnly}
                        onShiftTypeChange={setShiftTypeId}
                />

                <SelfReadCheckbox
                    checked={selfRead}
                    disabled={isReadOnly}
                    submittedAt={data.submittedAt}
                    signerName={currentEmployee?.name ?? employeeName}
                    onCheckedChange={setSelfRead}
                />
            </div>
                <div className="lg:col-span-2 [&>section]:mt-0">
                    {/*移到WorkItemsSection 工作細項 新增/合計/細項列表*/}
                    <WorkItemsSection
                        workItems={workItems}
                        totalHours={totalHours}
                        isReadOnly={isReadOnly}
                        onAdd={handleAddWorkItem}
                        onChange={handleWorkItemChange}
                        onRemove={handleRemoveWorkItem}
                    />

                    <div className="mt-6">
                        <AttachmentsSection
                            attachments={uploadAttachmentMutation.attachments}
                            disabled={isReadOnly}
                            isUploading={uploadAttachmentMutation.isPending}
                            isDeleting={uploadAttachmentMutation.deleteAttachmentMutation.isPending}
                            onPreview={(attachmentId) => {
                                
                                const attachment =
                                    uploadAttachmentMutation.attachments.find(
                                        (item) => item.id === attachmentId,
                                    );
                                
                                if(!attachment?.previewUrl)
                                {
                                    return;
                                }

                                window.open(
                                    attachment.previewUrl,
                                    "_blank",
                                    "noopener,noreferrer",
                                );
                            }}

                            onDownload={(attachmentId) => {
                                const attachment =
                                    uploadAttachmentMutation.attachments.find(
                                        (item) => item.id === attachmentId,
                                    );
                                if(!attachment?.previewUrl)
                                {
                                    return;
                                }

                                const downloadLink = document.createElement("a");
                                downloadLink.href = attachment.previewUrl;
                                downloadLink.download = attachment.fileName;
                                document.body.appendChild(downloadLink);
                                downloadLink.click();
                                downloadLink.remove();
                            }}
                                
                            onDelete={(attachmentId) => {
                                if(!id)
                                {
                                    return;
                                }

                                uploadAttachmentMutation.deleteAttachmentMutation.mutate({
                                    logId: id,
                                    attachmentId,
                                });
                            }}
                            onFileSelected={(file) => {
                                if(!id)
                                {
                                    return;
                                }

                                uploadAttachmentMutation.mutate({
                                    logId: id,
                                    file,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}