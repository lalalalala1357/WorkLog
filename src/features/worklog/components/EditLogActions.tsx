import { Button } from "../../../components/ui/button";

interface EditLogActionsProps
{
    onCancel: () => void;
    onSaveDraft: () => void;
    onSubmit: () => void;
    isSaveDisabled:boolean;
    isSubmitDisabled:boolean;
    isSaving:boolean;
    isSubmitting:boolean;
}

export function EditLogActions({
    onCancel,
    onSaveDraft,
    onSubmit,
    isSaveDisabled,
    isSubmitDisabled,
    isSaving,
    isSubmitting,
}:EditLogActionsProps)

{
    return(
        <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                >
                    取消
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={onSaveDraft}
                    disabled={isSaveDisabled}
                        
                >
                    {isSaving ? "儲存中..." : "儲存草稿"}
                </Button>

                <Button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSubmitDisabled}
                >
                    {isSubmitting ? "送出中..." : "送出"}
                </Button>
            </div>
    )
}