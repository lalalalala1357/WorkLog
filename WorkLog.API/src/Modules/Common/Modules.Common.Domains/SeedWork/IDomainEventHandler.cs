namespace Modules.Common.Domains.SeedWork
{
    public interface IDomainEventHandler;

    public interface IDomainEventHandler<in TEvent> : IDomainEventHandler where TEvent : IDomainEvent
    {
        Task HandleAsync(TEvent domainEvent, CancellationToken cancellationToken = default);
    }

}
