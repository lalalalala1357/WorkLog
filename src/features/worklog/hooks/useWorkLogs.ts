import { useMutation , useQuery , useQueryClient } from "@tanstack/react-query";
import type { WorkLog , UpdateWorkLogRequest , WorkLogDetail } from "../types/WorkLog";
import {
  createWorkLog,
  deleteWorkLog,
  getShiftTypes,
  getWorkLog,
  getWorkLogs,
  updateWorkLog,
  submitWorkLog,
} from "../api/workLogApi";

export function useGetMyLogs(year: number, month: number) 
{
  return useQuery({
    queryKey: ["worklogs", year, month],
    queryFn: () => getWorkLogs(year, month),
  });
}

export function useGetWorkLog(id: string | undefined)
{
  return useQuery({
    queryKey: ["worklogs",id],
    queryFn: () => getWorkLog(id!),
    enabled: Boolean(id),
  });
}

export function useGetShiftTypes()
{
  return useQuery({
    queryKey: ["shift-types"],
    queryFn: getShiftTypes,
  });
}

export function useUpdateWorkLog()
{
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:(
    {
      id,
      request,
    }: {
      id:string;
      request: UpdateWorkLogRequest;
    }) => updateWorkLog(id , request),

    onSuccess:(updatedLog) => {
      queryClient.setQueryData(
        ["worklogs",updatedLog.id],
        updatedLog,
      );
      void queryClient.invalidateQueries({
        queryKey:["worklogs"],
      });
    },
  });
}

export function useSubmitWorkLog()
{
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitWorkLog,

    onSuccess:(submittedLog) => {
      queryClient.setQueryData<WorkLogDetail>(
        ["worklogs" , submittedLog.id],
        (currentLog) => {
          if(!currentLog)
          {
            return currentLog;
          }

          return {
            ...currentLog,
            ...submittedLog,
          };
        },
      );
    },
  });
}

export function useCreateLog()
{
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createWorkLog,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["worklogs"],
      });
    },
  });
}

export function useDeleteLog()
{
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkLog,

    onSuccess: (_data , deleteId) => {
      queryClient.setQueriesData<WorkLog[]>(
      {
         queryKey: ["worklogs"],
      },
      (oldData) => {
        return oldData?.filter(
          (log) => log.id !== deleteId,
        );
       },
      );
    },
  });
}