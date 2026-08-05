using Microsoft.Extensions.DependencyInjection;
using Modules.WorkLogs.Domains.WorkLogsAggregate;
using Modules.WorkLogs.Infrastructure.Repositories;

namespace Modules.WorkLogs.Infrastructure;
public static class DependencyInjection
{
    public static IServiceCollection AddWorkLogsInfrastructure(
        this IServiceCollection services)
    {
        services.AddSingleton<
            IWorkLogsRepository,
            InMemoryWorkLogsRepository>();

        return services;
    }
}