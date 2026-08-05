using Microsoft.Extensions.DependencyInjection;
using Modules.Common.Domains.SeedWork;
using Modules.Common.Infrastructure.EventBus;

namespace Modules.Common.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddCommonInfrastructure(this IServiceCollection services)
        {
            services.AddScoped<IDomainEventsDispatcher, DomainEventsDispatcher>();

            services.AddScoped<IEventBus, InMemoryEventBus>();

            return services;
        }
    }
}
