using Microsoft.Extensions.DependencyInjection;

namespace Modules.Common.Features
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddCommonModule(this IServiceCollection services)
        {
            return services;
        }
    }
}
