import { Button } from "../../../components/ui/button";

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
    function handlePreviousMonth()
    {
        if(month === 1)
        {
            onYearChange(year - 1);
            onMonthChange(12);
            return;
        }
        onMonthChange(month - 1);
    }

    function handleNextMonth()
    {
        if(month === 12)
        {
            onYearChange(year + 1);
            onMonthChange(1);
            return;
        }
        onMonthChange(month + 1);
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="上一個月"
                onClick={handlePreviousMonth}
            >
                ←
            </Button>

            <p className="min-w-32 text-center font-medium">
                {year} 年 {month} 月
            </p>

            <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="下一個月"
                onClick={handleNextMonth}
            >
                →
            </Button>
        </div>
    );      
}