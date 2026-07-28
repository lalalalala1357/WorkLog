import { apiClient } from "../../../lib/apiClient";
import type { ApiResponse, WorkLog } from "../types/WorkLog";

export async function getWorkLogs
(
    year: number,
    month: number,
):Promise<WorkLog[]>

{
    const response = await apiClient.get<ApiResponse<WorkLog[]>>("/worklogs",
        {
            params: {
                year,
                month,
            },
        }
    );
    return response.data.data;
}