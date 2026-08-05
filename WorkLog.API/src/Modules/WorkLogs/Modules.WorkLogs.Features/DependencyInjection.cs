using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Modules.Common.Features.Extensions;

namespace Modules.WorkLogs.Features
{
    public static class DependencyInjection
    {
        // Rename this method like
        // public static IServiceCollection Add<ModuleName>Module(this IServiceCollection services, IConfiguration configuration)
        public static IServiceCollection AddWorkLogsModule(this IServiceCollection services, IConfiguration configuration)
        {
            services.RegisterHandlersFromAssemblyContaining(typeof(DependencyInjection));

            return services;
        }
    }
}
