import { apiClient } from "../../../lib/apiClient";
import type {
    ApiResponse,
    WorkItemRequest,
    WorkItemMutationResponse,
} from "../types/WorkLog";

export async function updateWorkItem(
    logId: string,
    itemId: string,
    request: WorkItemRequest,
):Promise<WorkItemMutationResponse>
{
    const response =
        await apiClient.put<ApiResponse<WorkItemMutationResponse>>(
            `/worklogs/${logId}/items/${itemId}`,
            request,
        );
    return response.data.data;   
}

export async function createWorkItem(
    logId: string,
    request: WorkItemRequest,
):Promise<WorkItemMutationResponse>
{
    const response =
        await apiClient.post<ApiResponse<WorkItemMutationResponse>>(
            `/worklogs/${logId}/items`,
            request,
        );

    return response.data.data;
}

export async function deleteWorkItem(
    logId: string,
    itemId: string,
):Promise<number>
{
    const response =
        await apiClient.delete<ApiResponse<{logTotalHours: number}>
        >(`/worklogs/${logId}/items/${itemId}`,);

        return response.data.data.logTotalHours;
    
}