namespace NorthWind.Transactions.Entities.Services;

internal class DomainTransaction : IDomainTransaction, IDisposable
{
    TransactionScope TransactionScope;

    public void BeginTransaction()
    {
        if (OperatingSystem.IsWindows())
        {
            TransactionManager.ImplicitDistributedTransactions = true;
        }
        TransactionScope = new TransactionScope(
            TransactionScopeOption.Required,
            new TransactionOptions
            {
                IsolationLevel = IsolationLevel.ReadCommitted
            },
            TransactionScopeAsyncFlowOption.Enabled);
    }

    public void CommitTransaction()
    {
        TransactionScope?.Complete();
        Dispose();
    }

    public void RollbackTransaction()
    {
        Dispose();
    }

    public void Dispose()
    {
        TransactionScope?.Dispose();
        TransactionScope = null;
    }
}
