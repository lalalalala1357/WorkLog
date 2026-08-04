import { useEffect , useState } from "react";
import type { WorkLogDetail } from "../types/WorkLog";

export function useEditLogForm(
    workLog: WorkLogDetail | undefined,
)
{
    const [logDate, setLogDate] = useState("");
    const [shiftTypeId, setShiftTypeId] = useState("");
    const [selfRead, setSelfRead] = useState(false);

    const workLogId = workLog?.id;
    const originalLogDate = workLog?.logDate;
    const originalSelfRead = workLog?.selfRead;
    const originalShiftTypeId = workLog?.shiftType?.id;

    useEffect(() => {
        if(!workLogId)
        {
            return;
        }

        setLogDate(originalLogDate ?? "");
        setSelfRead(originalSelfRead ?? false);
        setShiftTypeId(originalShiftTypeId ?? "")
    },[
        workLogId,
        originalLogDate,
        originalSelfRead,
        originalShiftTypeId,
    ]);

    return {
        logDate,
        setLogDate,
        shiftTypeId,
        setShiftTypeId,
        selfRead,
        setSelfRead,
    };
}