export function getCalendarDays(
    year: number,
    month: number,
)
{
    const firstDayOfWeek = new Date(
        year,
        month - 1,
        1,
    ).getDay();

    const daysInMonth = new Date(
        year,
        month,
        0,
    ).getDate();

    const calendarDays: Array<number | null> =[
        ...Array<null>(firstDayOfWeek).fill(null),
        ...Array.from(
            { length:daysInMonth },
            (_, index) => index + 1,
        ),
    ];

    while(calendarDays.length % 7 !== 0)
    {
        calendarDays.push(null);
    }

    return calendarDays;
}