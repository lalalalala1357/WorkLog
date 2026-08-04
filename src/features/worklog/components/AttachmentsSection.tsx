import {Paperclip} from "lucide-react";
import  type {WorkAttachment} from "../types/Attachment";
import { Button } from "../../../components/ui/button";

interface AttachmentsSectionProps
{
    disabled: boolean;
    isUploading: boolean;
    onFileSelected: (file: File) => void;
    attachments: WorkAttachment[];
    isDeleting?: boolean;
    onPreview?: (attachmentId: string) => void;
    onDelete?: (attachmentId: string) => void;
    onDownload?: (attachmentId: string) => void;
}

export function AttachmentsSection({
    disabled,
    isUploading,
    onFileSelected,
    attachments,
    isDeleting = false,
    onDelete,
    onPreview,
    onDownload,
}:AttachmentsSectionProps)

{
    return (
        <section className="rounded-[8px] border bg-card">
            <div className="flex items-center gap-2 border-b px-4 py-4">
                <Paperclip
                    aria-hidden="true"
                    className="size-5 text-primary"
                />

                <h2 className="text-xl font-semibold">
                    附件檔案
                </h2>
            </div>

            <div className="p-4">
                <label className="flex min-h-14 cursor-pointer items-center justify-center rounded-[8px] border border-dashed border-muted-foreground/40 text-sm font-medium hover:bg-muted/50"
                    onDragOver={(event) => {
                        event.preventDefault();
                    }}

                    onDrop={(event) => {
                        event.preventDefault();

                        if(disabled || isUploading)
                        {
                            return;
                        }

                        const file = event.dataTransfer.files?.[0];

                        if
                        (file &&
                            (
                                file.type.startsWith("image/") ||
                                file.type === "application/pdf" ||
                                file.name.toLowerCase().endsWith(".pdf")
                            )
                        )

                        {
                            onFileSelected(file);
                        }
                    }}
                >
                    <input 
                        type="file"
                        accept="image/*,.pdf"
                        disabled={disabled || isUploading}
                        className="sr-only"
                        onChange={(event) => {
                            const file = event.target.files?.[0];

                            if(file)
                            {
                                onFileSelected(file);
                            }

                            event.target.value = "";
                        }}
                    />

                    <span>
                        {isUploading ? "上傳中..." : "＋ 新增附件"}
                    </span>
                </label>
            </div>

            {attachments.length > 0 && (
                <ul className="space-y-2 border-t p-4">
                    {attachments.map((attachment) => (
                        <li
                            key={attachment.id}
                            className="flex items-center justify-between gap-4 rounded-[4px] bg-muted px-3 py-2 text-sm"
                        >
                            <span className="min-w-0 truncate">
                                {attachment.fileName}
                            </span>

                            <span className="shrink-0 text-muted-foreground">
                                {Math.ceil(attachment.fileSize / 1024)} KB
                            </span>

                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onPreview?.(attachment.id)}
                            >
                                預覽
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onDownload?.(attachment.id)}
                            >
                                下載
                            </Button>

                            <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                disabled={disabled || isDeleting}
                                onClick={() => {
                                    onDelete?.(attachment.id);
                                }}
                            >
                                刪除
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}