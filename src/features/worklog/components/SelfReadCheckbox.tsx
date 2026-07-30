interface SelfReadCheckboxProps
{
    checked: boolean;
    disabled: boolean;
    onCheckedChange: (checked: boolean) => void;
}

export function SelfReadCheckbox({
    checked,
    disabled,
    onCheckedChange,
}:SelfReadCheckboxProps)
{
    return (
        <label className="mt-6 flex items-center gap-2">
            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => {
                    onCheckedChange(event.target.checked)
                }}
            />

            <span>本人已閱讀</span>
        </label>
    )
}