using System.ComponentModel.DataAnnotations;

namespace ToDo.WebAPI.Todoproject.Entities.ItemDto
{
    public class ForgotPasswordDto
    {
        [Required(ErrorMessage = "Email adresi gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi girin.")]
        [StringLength(256, ErrorMessage = "Email adresi 256 karakterden uzun olamaz.")]
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        [Required(ErrorMessage = "Email adresi gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi girin.")]
        [StringLength(256, ErrorMessage = "Email adresi 256 karakterden uzun olamaz.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Token gereklidir.")]
        public string Token { get; set; } = string.Empty;

        [Required(ErrorMessage = "Yeni şifre gereklidir.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Şifre 8-100 karakter arasında olmalıdır.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$",
            ErrorMessage = "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.")]
        public string NewPassword { get; set; } = string.Empty;
    }
}