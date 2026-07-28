export interface WorkLog
{
    id: string;
    logNo: string;
    logDate: string;
    status:"DRAFT" | "SUBMITTED";
    summary: string | null;
    totalHours: number | null;
}

export interface ApiResponse<T>
{
    success: boolean;
    data: T;
    message: string | null;
    errors: unknown[] | null;
}