import { apiClient } from '../../../lib/apiClient';
import type { WorkAttachment } from "../types/Attachment";
import type { ApiResponse } from "../types/WorkLog";

export async function uploadAttachment(
    logId: string,
    file: File,
):Promise<WorkAttachment>
{
    const formData = new FormData();
    formData.append("file", file);

    const response =
        await apiClient.post<ApiResponse<WorkAttachment>>(
            `/worklogs/${logId}/attachments`,
            formData,
        );
    return response.data.data;
    
}

export async function deleteAttachment(
    logId: string,
    attachmentId: string,
): Promise<void>
{
    await apiClient.delete<ApiResponse<null>>(
        `/worklogs/${logId}/attachments/${attachmentId}`,
    );
}