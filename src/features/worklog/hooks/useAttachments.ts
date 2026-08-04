import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { uploadAttachment ,deleteAttachment } from "../api/attachmentApi";
import type { WorkAttachment } from "../types/Attachment";

export function useUploadAttachment()
{
  const [attachments , setAttachments] = useState<WorkAttachment[]>([]);

  const uploadMutation = useMutation({
    mutationFn:({
      logId,
      file,
    }: {
      logId: string;
      file: File;
    }) => uploadAttachment(logId , file),

    onSuccess: (attachment , variables) => {
      setAttachments((currentAttachments) => [
        ...currentAttachments,
        {
          ...attachment,
          fileName: variables.file.name,
          fileSize: variables.file.size,
          contentType: variables.file.type || attachment.contentType,
          previewUrl: URL.createObjectURL(variables.file),
        },
      ]);
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: ({
      logId,
      attachmentId,
    }: {
      logId: string;
      attachmentId: string;
    }) => deleteAttachment(logId , attachmentId),

    onSuccess: (_data , variables) => {
      setAttachments((currentAttachment) => 
        currentAttachment.filter((attachment) => {
          const shouldDelete =
              attachment.id === variables.attachmentId;
          if(shouldDelete && attachment.previewUrl)
          {
            URL.revokeObjectURL(attachment.previewUrl);
          }
          return !shouldDelete;
        }),
      );
    },
  });

  return {
    ...uploadMutation,
    attachments,
    deleteAttachmentMutation,
  };
}