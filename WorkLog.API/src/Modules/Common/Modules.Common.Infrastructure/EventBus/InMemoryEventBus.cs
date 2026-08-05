using Microsoft.Extensions.DependencyInjection;
using Modules.Common.Domains.SeedWork;

namespace Modules.Common.Infrastructure.EventBus
{
    public class InMemoryEventBus : IEventBus
    {
        private readonly IServiceProvider _serviceProvider;

        public InMemoryEventBus(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task PublishAsync<TEvent>(
            TEvent @event,
            CancellationToken cancellationToken = default)
            where TEvent : IIntegrationEvent
        {
            using var scope = _serviceProvider.CreateScope();

            var handlerType = typeof(IIntegrationEventHandler<>)
                .MakeGenericType(@event.GetType());

            var handlers = scope.ServiceProvider.GetServices(handlerType);

            foreach (var handler in handlers)
            {
                if(handler is null)
                {
                    continue;
                }
                await ((dynamic)handler).Handle(
                    (dynamic)@event,
                    cancellationToken);
            }
        }
    }
}
