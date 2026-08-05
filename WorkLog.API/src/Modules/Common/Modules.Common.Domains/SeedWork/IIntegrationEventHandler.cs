namespace Modules.Common.Domains.SeedWork
{
    public interface IIntegrationEventHandler<in T> where T : IIntegrationEvent
    {
        Task Handle(T integrationEvent, CancellationToken cancellationToken = default);
    }
}
