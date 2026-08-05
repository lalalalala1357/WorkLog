using Microsoft.Extensions.DependencyInjection;
using Modules.Common.Domains.SeedWork;

namespace Modules.Common.Infrastructure
{
    public class DomainEventsDispatcher(
        IServiceProvider serviceProvider) : IDomainEventsDispatcher
    {
        public async Task DispatchAsync<TEvent>(
            TEvent domainEvent,
            CancellationToken cancellationToken = default)
            where TEvent : IDomainEvent
        {
            try
            {
                var handlers = serviceProvider.GetServices<IDomainEventHandler<TEvent>>().ToArray();

                var handlerTasks = handlers.Select(handler =>
                ExecuteHandlerAsync(handler, domainEvent, cancellationToken))
                    .ToList();

                await Task.WhenAll(handlerTasks);
            }
            catch (Exception)
            {
                throw;
            }
        }

        private async Task<Exception?> ExecuteHandlerAsync<TEvent>(
            IDomainEventHandler<TEvent> handler,
            TEvent domainEvent,
            CancellationToken cancellationToken) where TEvent : IDomainEvent
        {
            try
            {
                await handler.HandleAsync(domainEvent, cancellationToken);
                return null;
            }
            catch (Exception ex)
            {
                return ex;
            }
        }
    }
}
