import type { ShiftType } from "../types/WorkLog";     

interface BasicInfoSectionProps
{
    logDate: string;
    shiftTypeId:string;
    shiftTypes: ShiftType[];
    isReadOnly: boolean;
    onShiftTypeChange: (shiftTypeId: string) => void;
    employeeNo: string;
    employeeName: string;
    logNo: string;
    onLogDateChange:(logDate: string) => void;
}

export function BasicInfoSection({
    logDate,
    logNo,
    onLogDateChange,
    shiftTypeId,
    shiftTypes,
    isReadOnly,
    onShiftTypeChange,
    employeeNo,
    employeeName,
}:BasicInfoSectionProps)
{
    return(
        <section className="mt-6 rounded-[8px] border bg-card p-4">
            <h2 className="text-lg font-semibold">
                基本資訊
            </h2>
            <div className="mt-4 grid gap-4">

                <label className="grid gap-2">
                    <span className="text-sm font-medium">
                        日誌編號
                    </span>

                    <input
                        value={logNo}
                        readOnly
                        className="rounded-[4px] border bg-muted px-3 py-2"
                    />
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <span className="text-sm font-medium">
                            員工編號
                        </span>

                        <p className="font-medium">
                            {employeeNo || "-"}
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <span className="text-sm font-medium">
                                員工姓名
                        </span>

                        <p className="font-medium">
                            {employeeName || "-"}
                        </p>
                    </div>
                </div>

                <label className="grid gap-2">
                    <span className="text-sm font-medium">
                        日期<span className="ml-1 text-destructive">*</span>
                    </span>

                    <input
                        type="date"
                        value={logDate}
                        required
                        disabled={isReadOnly}
                        onChange={(event) => {
                            onLogDateChange(event.target.value);
                        }}
                        className="rounded-[4px] border bg-background px-3 py-2 disabled:bg-muted"
                    />
                </label>

                <label className="grid gap-2">
                    <span className="text-sm font-medium">
                        當日班別
                    </span>

                    <select
                        value={shiftTypeId}
                        onChange={(event) => {
                            onShiftTypeChange(event.target.value);
                        }}
                        disabled={isReadOnly}
                        className="rounded-[4px] border bg-background px-3 py-2"
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
            </div>
        </section>
    )
}