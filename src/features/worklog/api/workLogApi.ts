import { apiClient } from '../../../lib/apiClient';
import type
{
    ApiResponse,
    CreateWorkLog,
    WorkLog,
    WorkLogDetail,
    ShiftType,
    UpdateWorkLogRequest,
    SubmitWorkLogResponse,
} from "../types/WorkLog";

export async function getWorkLogs(
    year: number,
    month: number,
): Promise<WorkLog[]>
{
    const response =
        await apiClient.get<ApiResponse<WorkLog[]>>(
            "/worklogs",
            {
                params: {
                    year,
                    month,
                },
            },
        );

    return response.data.data;
}

export async function getWorkLog(id: string,):Promise<WorkLogDetail>
{
    const response = await apiClient.get<ApiResponse<WorkLogDetail>>(
        `/worklogs/${id}`,
    );
    return response.data.data;
}

export async function getShiftTypes(): Promise<ShiftType[]>
{
    const response = await apiClient.get<ApiResponse<ShiftType[]>>(
        "/shift-types",
    );
    return response.data.data;
}

export async function updateWorkLog(
    id: string,
    request:UpdateWorkLogRequest,
):Promise<WorkLogDetail>
{
    const response = await apiClient.put<ApiResponse<WorkLogDetail>>(
        `/worklogs/${id}`,
        request,
    );
        return response.data.data;
}

export async function submitWorkLog(
    id:string,
):Promise<SubmitWorkLogResponse>
{
    const response = await apiClient.post<ApiResponse<SubmitWorkLogResponse>>(
        `/worklogs/${id}/submit`,
        {},
    );
    return response.data.data;
}

export async function createWorkLog(): Promise<CreateWorkLog>
{
    const response =
        await apiClient.post<ApiResponse<CreateWorkLog>>(
            "/worklogs",
            {},
        );
    return response.data.data;
}

export async function deleteWorkLog(
    id: string,
): Promise<void>
{
    await apiClient.delete(`/worklogs/${id}`,);
}