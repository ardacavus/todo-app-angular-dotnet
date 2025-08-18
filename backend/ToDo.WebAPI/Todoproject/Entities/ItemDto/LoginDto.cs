using System.ComponentModel.DataAnnotations;

namespace ToDo.WebAPI.Todoproject.Entities.ItemDto
{
    public class LoginDto
    {
        [Required(ErrorMessage = "Email adresi gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi girin.")]
        [StringLength(256, ErrorMessage = "Email adresi 256 karakterden uzun olamaz.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Şifre 8-100 karakter arasında olmalıdır.")]
        public string Password { get; set; } = string.Empty;
    }
}