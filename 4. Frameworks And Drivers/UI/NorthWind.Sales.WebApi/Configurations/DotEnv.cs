#nullable enable
namespace NorthWind.Sales.WebApi.Configurations;

public static class DotEnv
{
    public static void Load(string? filePath = null)
    {
        filePath ??= FindEnvFile();
        if (filePath == null || !File.Exists(filePath)) return;

        foreach (var line in File.ReadAllLines(filePath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#')) continue;

            var separatorIndex = trimmed.IndexOf('=');
            if (separatorIndex <= 0) continue;

            var key = trimmed.Substring(0, separatorIndex).Trim();
            var val = trimmed.Substring(separatorIndex + 1).Trim();

            if (val.Length >= 2 && ((val.StartsWith('"') && val.EndsWith('"')) || (val.StartsWith('\'') && val.EndsWith('\''))))
            {
                val = val.Substring(1, val.Length - 2);
            }

            Environment.SetEnvironmentVariable(key, val);
        }

        // Aliases de conveniencia
        SetIfMissing("MembershipDBOptions__ConnectionString", Environment.GetEnvironmentVariable("MembershipDB__ConnectionString"));
        SetIfMissing("JwtOptions__SecurityKey", Environment.GetEnvironmentVariable("Jwt__SecretKey"));
        SetIfMissing("JwtOptions__ValidIssuer", Environment.GetEnvironmentVariable("Jwt__Issuer"));
        SetIfMissing("JwtOptions__ValidAudience", Environment.GetEnvironmentVariable("Jwt__Audience"));
        SetIfMissing("JwtOptions__ExpireInMinutes", Environment.GetEnvironmentVariable("Jwt__ExpirationMinutes"));
        SetIfMissing("SmtpOptions__SmtpHost", Environment.GetEnvironmentVariable("Smtp__Host"));
        SetIfMissing("SmtpOptions__SmtpHostPort", Environment.GetEnvironmentVariable("Smtp__Port"));
        SetIfMissing("SmtpOptions__SmtpUserName", Environment.GetEnvironmentVariable("Smtp__UserName"));
        SetIfMissing("SmtpOptions__SmtpPassword", Environment.GetEnvironmentVariable("Smtp__Password"));
        SetIfMissing("SmtpOptions__SenderEmail", Environment.GetEnvironmentVariable("Smtp__From"));
    }

    private static void SetIfMissing(string targetKey, string? value)
    {
        if (!string.IsNullOrWhiteSpace(value) && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(targetKey)))
        {
            Environment.SetEnvironmentVariable(targetKey, value);
        }
    }

    private static string? FindEnvFile()
    {
        var current = new DirectoryInfo(AppContext.BaseDirectory);
        while (current != null)
        {
            var candidate = Path.Combine(current.FullName, ".env");
            if (File.Exists(candidate)) return candidate;
            current = current.Parent;
        }

        current = new DirectoryInfo(Directory.GetCurrentDirectory());
        while (current != null)
        {
            var candidate = Path.Combine(current.FullName, ".env");
            if (File.Exists(candidate)) return candidate;
            current = current.Parent;
        }

        return null;
    }
}
