using Microsoft.Extensions.Options;
using System.Net.Mail;
using System.Net;

namespace MaBeDi.Services;

public class EmailService
{
    private readonly EmailSettings _emailSettings;
    private readonly AppSettings _appSettings;

    public EmailService(IOptions<EmailSettings> emailOptions, IOptions<AppSettings> appOptions)
    {
        _emailSettings = emailOptions.Value;
        _appSettings = appOptions.Value;
    }

    public async Task SendPasswordResetEmailAsync(string toEmail, string token)
    {
        string resetLink = $"{_appSettings.FrontendBaseUrl}/reset-password?token={token}";

        string htmlContent = $@"
            <p>Hola,</p>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <p><a href='{resetLink}'>Restablecer contraseña</a></p>
            <p>Si no solicitaste este cambio, ignora este correo.</p>
        ";

        await SendEmailAsync(toEmail, "Restablece tu contraseña", htmlContent);
    }

    public async Task SendEmailAsync(string toEmail, string subject, string htmlContent)
    {
        using var client = new SmtpClient(_emailSettings.SmtpServer, _emailSettings.Port)
        {
            Credentials = new NetworkCredential(_emailSettings.Username, _emailSettings.Password),
            EnableSsl = true,
            DeliveryMethod = SmtpDeliveryMethod.Network,
            UseDefaultCredentials = false
        };

        var message = new MailMessage
        {
            From = new MailAddress(_emailSettings.From, _emailSettings.SenderName),
            Subject = subject,
            Body = htmlContent,
            IsBodyHtml = true
        };

        message.To.Add(toEmail);

        await client.SendMailAsync(message);
    }
}