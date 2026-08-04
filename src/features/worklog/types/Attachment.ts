export interface WorkAttachment
{
    id: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
    previewUrl?: string;
}