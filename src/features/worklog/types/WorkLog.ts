export interface WorkLog
{
    id: string;
    logNo: string;
    logDate: string;
    status:"DRAFT" | "SUBMITTED";
    summary: string | null;
    totalHours: number | null;
}

export interface WorkLogStats
{
    completionRate: number;
    draftCount: number;
    submittedCount: number;
}

export interface ApiResponse<T>
{
    success: boolean;
    data: T;
    message: string | null;
    errors: unknown[] | null;
}

export interface CreateWorkLog
{
    id: string;
    logNo: string;
    logDate: string;
    status: "DRAFT";
}

export interface ShiftType
{
    id: string;
    name: string;
    description: string | null;
}

export interface WorkItem
{
    id: string;
    seq: number;
    taskName: string;
    description: string | null;
    hours: number;
    progress: number;
}

export interface WorkItemRequest
{
    taskName:string;
    description: string | null;
    hours: number;
    progress: number;
}

export interface WorkItemMutationResponse
{
    item: WorkItem;
    logTotalHours: number;
}

export interface WorkLogDetail
{
    id: string;
    logNo: string;
    logDate: string;
    shiftType: ShiftType | null;
    status: "DRAFT" | "SUBMITTED";
    selfRead: boolean;
    totalHours: number | null;
    submittedAt: string | null;
    createdAt: string;
    updatedAt: string;
    workItems: WorkItem[];
}

export interface UpdateWorkLogRequest
{
    logDate:string;
    shiftTypeId:string;
    selfRead:boolean;
}

export interface SubmitWorkLogResponse
{
    id: string;
    logNo: string;
    status: "SUBMITTED";
    submittedAt: string;
}
