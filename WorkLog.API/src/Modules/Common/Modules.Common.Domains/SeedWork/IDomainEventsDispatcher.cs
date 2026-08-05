namespace Modules.Common.Domains.SeedWork
{
    public interface IDomainEventsDispatcher
    {
        Task DispatchAsync<TEvent>(TEvent domainEvent, CancellationToken cancellationToken = default) where TEvent : IDomainEvent;
    }
}
