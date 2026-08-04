import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/apiClient";

interface CurrentEmployee
{
    employeeNo: string;
    name: string;
}

interface CurrentEmployeeResponse
{
    success: boolean;
    data: CurrentEmployee;
    message: string | null;
    errors: unknown[] | null;
}

async function getCurrentEmployee():Promise<CurrentEmployee>
{
    const response =
        await apiClient.get<CurrentEmployeeResponse>("/auth/me");

    return response.data.data;
}

export function useCurrentEmployee()
{
    return useQuery({
        queryKey:["auth" , "me"],
        queryFn: getCurrentEmployee,
    });
}