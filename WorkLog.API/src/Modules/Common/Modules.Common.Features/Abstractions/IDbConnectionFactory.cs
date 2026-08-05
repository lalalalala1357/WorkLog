using System.Data;

namespace Modules.Common.Features.Abstractions
{
    public interface IDbConnectionFactory
    {
        Task<IDbConnection> CreateAsync();
    }
}
