using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ToDo.WebAPI.Services;
using ToDo.WebAPI.Todoproject.Entities.Entity;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;
using Microsoft.AspNetCore.RateLimiting;

namespace ToDo.WebAPI.Todoproject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            IConfiguration configuration,
            IEmailService emailService,
            ILogger<AuthController> logger)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _emailService = emailService;
            _logger = logger;
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Geçersiz veri girişi." });
            }

            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                _logger.LogWarning("Registration attempted with existing email");
                return BadRequest(new { message = "Bu email adresi zaten kullanımda! Giriş yapmayı deneyin." });
            }

            var user = new User
            {
                UserName = model.Email,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                _logger.LogWarning("User registration failed");
                return BadRequest(new { message = "Kayıt işlemi başarısız. Lütfen bilgilerinizi kontrol edin." });
            }

            _logger.LogInformation($"New user registered with ID: {user.Id}");
            return Ok(new { message = "Kayıt başarılı!" });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Geçersiz veri girişi." });
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Login attempted with non-existent email");
                return BadRequest(new { message = "Bu email adresi kayıtlı değil! Önce hesap oluşturun." });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded)
            {
                _logger.LogWarning($"Failed login attempt for user ID: {user.Id}");
                return BadRequest(new { message = "Şifre hatalı! Lütfen şifrenizi kontrol edin." });
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(24),
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            _logger.LogInformation($"Successful login for user ID: {user.Id}");
            return Ok(new
            {
                token = tokenString,
                expiresAt = DateTime.Now.AddHours(24),
                message = "Giriş başarılı!"
            });
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Profile access attempted without valid user ID");
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning($"Profile access attempted for non-existent user ID: {userId}");
                return NotFound(new { message = "Kullanıcı bulunamadı!" });
            }

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                createdAt = user.CreatedAt
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation($"User logout for ID: {userId}");
            return Ok(new { message = "Çıkış başarılı!" });
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Geçersiz email adresi." });
            }

            _logger.LogInformation("Password reset request received");

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Password reset attempted for non-existent user");
                return Ok(new { message = "Eğer email adresiniz sistemde kayıtlıysa, şifre sıfırlama linki gönderilmiştir." });
            }

            var today = DateTime.UtcNow.Date;
            if (user.LastPasswordResetRequest?.Date == today && user.PasswordResetRequestCount >= 3)
            {
                _logger.LogWarning($"Rate limit exceeded for user ID: {user.Id}");
                return BadRequest(new { message = "Günde sadece 3 kere şifre sıfırlama talebinde bulunabilirsiniz." });
            }

            if (user.LastPasswordResetRequest?.Date != today)
            {
                user.PasswordResetRequestCount = 0;
            }
            user.LastPasswordResetRequest = DateTime.UtcNow;
            user.PasswordResetRequestCount++;
            await _userManager.UpdateAsync(user);

            _logger.LogInformation($"Password reset request count: {user.PasswordResetRequestCount}/3 for user ID: {user.Id}");

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

            try
            {
                await _emailService.SendPasswordResetEmailAsync(user.Email!, resetToken, user.FirstName);
                _logger.LogInformation($"Password reset email sent successfully for user ID: {user.Id}");
                return Ok(new { message = "Şifre sıfırlama linki email adresinize gönderildi." });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to send password reset email: {ex.GetType().Name}");
                return BadRequest(new { message = "Email gönderiminde sorun oluştu. Lütfen daha sonra tekrar deneyiniz." });
            }
        }

        [EnableRateLimiting("AuthPolicy")]
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Geçersiz veri girişi." });
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                _logger.LogWarning("Password reset attempted for non-existent user");
                return BadRequest(new { message = "Geçersiz işlem." });
            }

            var result = await _userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
            if (!result.Succeeded)
            {
                _logger.LogWarning($"Password reset failed for user ID: {user.Id}");
                return BadRequest(new { message = "Şifre sıfırlama başarısız. Token geçersiz veya süresi dolmuş." });
            }

            _logger.LogInformation($"Password reset successful for user ID: {user.Id}");
            return Ok(new { message = "Şifreniz başarıyla sıfırlandı." });
        }
    }
}