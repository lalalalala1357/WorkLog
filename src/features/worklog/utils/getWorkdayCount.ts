export function getWorkdayCount(
    year: number,
    month: number,
)
{
    const lastDay = new Date(year , month , 0).getDate();
    let workdayCount = 0;

    for(let day = 1;day <= lastDay; day++)
    {
        const dayOfWeek = new Date(year , month - 1 , day).getDay();

        if(dayOfWeek !== 0 && dayOfWeek !== 6)
        {
            workdayCount++;
        }
    }
    return workdayCount;
}