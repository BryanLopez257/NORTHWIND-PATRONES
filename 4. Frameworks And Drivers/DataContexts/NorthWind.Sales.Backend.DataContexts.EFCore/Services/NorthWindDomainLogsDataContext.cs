using System.Transactions;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Services;

internal class NorthWindDomainLogsDataContext(IOptions<DBOptions> dbOptions) :
    NorthWindDomainLogsContext(dbOptions),
    INorthWindDomainLogsDataContext
{
    public async Task AddLogAsync(DomainLog log)
    {
        await AddAsync(log);
    }

    public async Task SaveChangesAsync()
    {
        using var scope = new TransactionScope(
            TransactionScopeOption.Suppress,
            TransactionScopeAsyncFlowOption.Enabled);

        await base.SaveChangesAsync();
    }
}
