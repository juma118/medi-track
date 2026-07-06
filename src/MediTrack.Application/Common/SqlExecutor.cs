using System.Data;
using System.Data.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace MediTrack.Application.Common;

public static class SqlExecutor
{
    public static async Task<List<T>> QueryAsync<T>(
        this DatabaseFacade database,
        string sql,
        Func<DbDataReader, T> map,
        CancellationToken ct,
        params (string Name, object? Value)[] parameters)
    {
        var connection = database.GetDbConnection();
        var opened = false;
        if (connection.State != ConnectionState.Open)
        {
            await connection.OpenAsync(ct);
            opened = true;
        }

        try
        {
            await using var cmd = connection.CreateCommand();
            cmd.CommandText = sql;
            foreach (var (name, value) in parameters)
            {
                var p = cmd.CreateParameter();
                p.ParameterName = name;
                p.Value = value ?? DBNull.Value;
                cmd.Parameters.Add(p);
            }

            var results = new List<T>();
            await using var reader = await cmd.ExecuteReaderAsync(ct);
            while (await reader.ReadAsync(ct))
                results.Add(map(reader));
            return results;
        }
        finally
        {
            if (opened) await connection.CloseAsync();
        }
    }

    public static async Task<T> QuerySingleAsync<T>(
        this DatabaseFacade database,
        string sql,
        Func<DbDataReader, T> map,
        CancellationToken ct,
        params (string Name, object? Value)[] parameters)
    {
        var list = await database.QueryAsync(sql, map, ct, parameters);
        return list.Count > 0 ? list[0] : throw new InvalidOperationException("Query returned no rows.");
    }
}
