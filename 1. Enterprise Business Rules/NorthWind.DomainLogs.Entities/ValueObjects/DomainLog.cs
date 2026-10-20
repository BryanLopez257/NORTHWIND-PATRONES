namespace NorthWind.DomainLogs.Entities.ValueObjects;

public class DomainLog(string information, string userName = null)
{
    public DateTime DateTime => DateTime.Now;
    public string Information => information;
    public string UserName => userName;
}
