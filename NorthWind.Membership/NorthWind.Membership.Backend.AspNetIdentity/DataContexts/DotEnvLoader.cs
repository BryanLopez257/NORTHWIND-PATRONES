#nullable enable
namespace NorthWind.Membership.Backend.AspNetIdentity.DataContexts;

internal static class DotEnvLoader
{
    public static void Load()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        string? envPath = null;

        while (current != null)
        {
            var candidate = Path.Combine(current.FullName, ".env");
            if (File.Exists(candidate))
            {
                envPath = candidate;
                break;
            }
            current = current.Parent;
        }

        if (envPath == null)
        {
            current = new DirectoryInfo(Directory.GetCurrentDirectory());
            while (current != null)
            {
                var candidate = Path.Combine(current.FullName, ".env");
                if (File.Exists(candidate))
                {
                    envPath = candidate;
                    break;
                }
                current = current.Parent;
            }
        }

        if (envPath == null || !File.Exists(envPath)) return;

        foreach (var line in File.ReadAllLines(envPath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#')) continue;

            var sep = trimmed.IndexOf('=');
            if (sep <= 0) continue;

            var key = trimmed.Substring(0, sep).Trim();
            var val = trimmed.Substring(sep + 1).Trim();

            if (val.Length >= 2 && ((val.StartsWith('"') && val.EndsWith('"')) || (val.StartsWith('\'') && val.EndsWith('\''))))
            {
                val = val.Substring(1, val.Length - 2);
            }

            if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
            {
                Environment.SetEnvironmentVariable(key, val);
            }
        }
    }
}
