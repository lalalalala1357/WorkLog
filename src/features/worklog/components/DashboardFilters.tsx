interface DashboardFiltersProps
{
    year: number;
    month: number;
    onYearChange:(year: number) => void;
    onMonthChange:(month: number) => void;
}
export function DashboardFilters({
    year,
    month,
    onYearChange,
    onMonthChange,
}:DashboardFiltersProps)
{
    return (
        <div className="mt-6 flex gap-2">
            <select
                aria-label="年份"
                value={year}
                onChange={(event) => {
                    onYearChange(Number(event.target.value));
                }}
                className="rounded-md border bg-background px-3 py-2"
            >
                <option value={2025}>2025 年</option>
                <option value={2026}>2026 年</option>
                <option value={2027}>2027 年</option>
            </select>

            <select
                aria-label="月份"
                value={month}
                onChange={(event) => {
                    onMonthChange(Number(event.target.value));
                }}
                className="rounded-md border bg-background px-3 py-2"
            >
                {Array.from({length:12},(_, index) => {
                    const value = index + 1;

                    return(
                        <option key={value} value={value}>
                            {value} 月
                        </option>
                    );
                })}
            </select>
        </div>
    );      
}