interface SelfReadCheckboxProps
{
    checked: boolean;
    disabled: boolean;
    onCheckedChange: (checked: boolean) => void;
    submittedAt: string | null;
    signerName: string;
}

export function SelfReadCheckbox({
    checked,
    disabled,
    onCheckedChange,
    submittedAt,
    signerName,
}:SelfReadCheckboxProps)
{
    return (
        <div className="mt-6 rounded-[8px] border bg-card p-4">
            <h2 className="text-lg font-semibold">
                簽核資訊
            </h2>
            
            <label className="mt-4 flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    className="accent-primary"
                    onChange={(event) => {
                        onCheckedChange(event.target.checked)
                    }}
                />
                <span>本人已閱讀</span>
            </label>

            <div className="mt-4">
                <p className="mb-2 text-sm text-muted-foreground">
                    簽核清單
                </p>

                <div className="overflow-hidden rounded-[8px] border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-3 py-2 text-left font-medium">
                                    簽核者
                                </th>
                                <th className="px-3 py-2 text-left font-medium">
                                    簽核時間
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {submittedAt ? (
                                <tr>
                                    <td className="border-t px-3 py-2">
                                        {signerName || "-"}
                                    </td>
                                    <td className="border-t px-3 py-2">
                                        {new Date(submittedAt).toLocaleString("zh-TW")}
                                    </td>
                                </tr>
                            ) : (
                                <tr>
                                    <td
                                        colSpan={2}
                                        className="border-t px-3 py-3 italic text-muted-foreground"
                                    >
                                        尚未有簽核紀錄
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}