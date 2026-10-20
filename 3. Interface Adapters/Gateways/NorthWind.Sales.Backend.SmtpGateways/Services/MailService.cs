namespace NorthWind.Sales.Backend.SmtpGateways.Services;

internal class MailService(IOptions<SmtpOptions> smtpOptions, ILogger<MailService> logger) : IMailService
{
    public async Task SendMailToAdministrator(string subject, string body)
    {
        try
        {
            MailMessage Message = new(smtpOptions.Value.SenderEmail, smtpOptions.Value.AdministratorEmail)
            {
                Subject = subject,
                Body = body
            };

            using SmtpClient Client = new(smtpOptions.Value.SmtpHost, smtpOptions.Value.SmtpHostPort)
            {
                Credentials = new NetworkCredential(smtpOptions.Value.SmtpUserName, smtpOptions.Value.SmtpPassword),
                EnableSsl = true
            };

            await Client.SendMailAsync(Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "{Message}", ex.Message);
            throw;
        }
    }
}
