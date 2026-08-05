using Modules.Common.Features.Abstractions;
using Npgsql;
using System.Data;

namespace Modules.Common.Infrastructure.Database
{
    public class NpgsqlConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public NpgsqlConnectionFactory(string connectionString)
        {
            _connectionString = connectionString;
        }

        public async Task<IDbConnection> CreateAsync()
        {
            NpgsqlConnection conn = new NpgsqlConnection(_connectionString);
            await conn.OpenAsync();
            return conn;
        }
    }
}
