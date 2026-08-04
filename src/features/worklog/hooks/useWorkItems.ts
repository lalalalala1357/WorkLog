import { useMutation } from "@tanstack/react-query";
import type { WorkItemRequest } from "../types/WorkLog";
import
{
    updateWorkItem,
    createWorkItem,
    deleteWorkItem,
} from "../api/workItemApi";


export function useUpdateWorkItem()
{
  return useMutation({
    mutationFn:({
      logId,
      itemId,
      request,
    }:{
      logId: string;
      itemId: string;
      request: WorkItemRequest;
    }) => updateWorkItem (logId , itemId , request),
  });
}

export function useCreateWorkItem()
{
  return useMutation({
    mutationFn:({
      logId,
      request,
    }: {
      logId: string;
      request: WorkItemRequest;
    }) => createWorkItem(logId , request),
  });
}

export function useDeleteWorkItem()
{
  return useMutation({
    mutationFn: ({
      logId,
      itemId,
    }: {
      logId: string;
      itemId: string;
    }) => deleteWorkItem(logId , itemId),
  });
}