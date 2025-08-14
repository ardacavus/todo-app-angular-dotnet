using MailKit.Net.Smtp;
using MimeKit;

namespace ToDo.WebAPI.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string resetToken, string userName);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetToken, string userName)
        {
            try
            {
                var resetLink = $"http://localhost:4200/reset-password?email={email}&token={Uri.EscapeDataString(resetToken)}";

                var emailMessage = new MimeMessage();
                emailMessage.From.Add(new MailboxAddress(
                    _configuration["EmailSettings:SenderName"],
                    _configuration["EmailSettings:SenderEmail"]));
                emailMessage.To.Add(new MailboxAddress("", email));
                emailMessage.Subject = "Todo App - Şifre Sıfırlama";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;'>
                            <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;'>
                                <h1 style='color: white; margin: 0; font-size: 24px;'>🔑 Şifre Sıfırlama</h1>
                            </div>
                            <div style='padding: 30px; background: white;'>
                                <p style='font-size: 16px; color: #333;'>Merhaba <strong>{userName}</strong>,</p>
                                <p style='font-size: 14px; color: #555; line-height: 1.6;'>
                                    Todo App hesabınız için şifre sıfırlama talebiniz alınmıştır.
                                </p>
                                <p style='font-size: 14px; color: #555; line-height: 1.6;'>
                                    Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:
                                </p>
                                <div style='text-align: center; margin: 30px 0;'>
                                    <a href='{resetLink}' 
                                       style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                                              color: white; 
                                              padding: 15px 30px; 
                                              text-decoration: none; 
                                              border-radius: 8px; 
                                              display: inline-block;
                                              font-weight: bold;
                                              font-size: 16px;'>
                                        Şifremi Sıfırla
                                    </a>
                                </div>
                                <p style='color: #888; font-size: 13px; line-height: 1.5;'>
                                    <strong>Not:</strong> Bu link 1 saat geçerlidir.
                                </p>
                                <p style='color: #888; font-size: 13px; line-height: 1.5;'>
                                    Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.
                                </p>
                            </div>
                            <div style='background: #f8f9fa; color: #666; padding: 15px; text-align: center; font-size: 12px; border-top: 1px solid #eee;'>
                                © 2025 Todo App. Arda Çavuş tarafından geliştirilmiştir.
                            </div>
                        </div>",
                    TextBody = $@"
Merhaba {userName},

Todo App hesabınız için şifre sıfırlama talebiniz alınmıştır.

Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:
{resetLink}

Bu link 1 saat geçerlidir.

Eğer bu talebi siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.

© 2025 Todo App
                    "
                };

                emailMessage.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                await client.ConnectAsync(
                    _configuration["EmailSettings:SmtpServer"],
                    int.Parse(_configuration["EmailSettings:Port"]),
                    MailKit.Security.SecureSocketOptions.None);
                await client.AuthenticateAsync(
                    _configuration["EmailSettings:SenderEmail"],
                    _configuration["EmailSettings:SenderPassword"]);
                await client.SendAsync(emailMessage);
                await client.DisconnectAsync(true);

                _logger.LogInformation($"Password reset email sent successfully to {email}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send email to {email}: {ex.Message}");
                throw;
            }
        }
    }
}
