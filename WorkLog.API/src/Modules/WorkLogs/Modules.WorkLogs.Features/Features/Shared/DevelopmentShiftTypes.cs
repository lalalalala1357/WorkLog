namespace Modules.WorkLogs.Features.Features.Shared;

public static class DevelopmentShiftTypes
{
    public static readonly ShiftTypeResponse Normal = new(
        Guid.Parse("c2f3a4b5-0001-4a1a-9f2a-0f1e2d3c4b5a"),
        "正常班",
        "08:00-12:00, 13:00-17:30");

        public static ShiftTypeResponse? Find(Guid id)
        {
            return id == Normal.Id
            ? Normal
            : null;
        }
}
