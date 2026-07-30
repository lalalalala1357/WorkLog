import type { ShiftType } from "../types/WorkLog";     

interface BasicInfoSectionProps
{
    logDate: string;
    shiftTypeId:string;
    shiftTypes: ShiftType[];
    isReadOnly: boolean;
    onShiftTypeChange: (shiftTypeId: string) => void;
}

export function BasicInfoSection({
    logDate,
    shiftTypeId,
    shiftTypes,
    isReadOnly,
    onShiftTypeChange,
}:BasicInfoSectionProps)
{
    return(
        <section className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
                <span className="text-sm font-medium">
                    日期
                </span>

                    <input
                        type="date"
                        value={logDate}
                        readOnly
                        className="rounded-md border bg-muted px-3 py-2"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium">
                        班別
                    </span>

                    <select
                        value={shiftTypeId}
                        onChange={(event) => {
                            onShiftTypeChange(event.target.value);
                        }}
                        disabled={isReadOnly}
                        className="rounded-md border bg-background px-3 py-2"
                    >
                        <option value="">
                            請選擇班別
                        </option>

                        {shiftTypes.map((shiftType) => (
                            <option
                                key={shiftType.id}
                                value={shiftType.id}
                            >
                                {shiftType.name}
                            </option> 
                        ))}
                    </select>
                </label>
            </section>
    )
}