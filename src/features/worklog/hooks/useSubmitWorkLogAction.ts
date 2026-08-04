import { useSubmitWorkLog } from './useWorkLogs';
import axios from 'axios';
import type { ApiResponse } from '../types/WorkLog';

export function useSubmitWorkLogAction(
    id: string | undefined,
    selfRead: boolean,
)
{
    const submitLog = useSubmitWorkLog();

    function handleSubmit()
    {
        if(!id || !selfRead)
        {
            return;
        }
        submitLog.mutate(id);
    }

    const isSubmitting = submitLog.isPending;

    const submitErrorMessage =
        axios.isAxiosError<ApiResponse<unknown>>(submitLog.error)
            ? submitLog.error.response?.data.message
            : submitLog.isError
                ? "送出失敗 請稍後再試"
                : null;

    return {
        handleSubmit,
        isSubmitting,
        submitErrorMessage,
    };
}