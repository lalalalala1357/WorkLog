import { useQuery } from "@tanstack/react-query";
import { getWorkLogs } from "../api/workLogApi";

export function useWorkLogs(year: number, month: number) 
{
  return useQuery({
    queryKey: ["worklogs", year, month],
    queryFn: () => getWorkLogs(year, month),
  });
}