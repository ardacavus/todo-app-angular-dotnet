using System.ComponentModel.DataAnnotations;

namespace ToDo.WebAPI.Todoproject.Entities.ItemDto
{
    public class RegisterDto
    {
        [Required(ErrorMessage = "Ad gereklidir.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Ad 2-50 karakter arasında olmalıdır.")]
        [RegularExpression(@"^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$", ErrorMessage = "Ad sadece harf içerebilir.")]
        public string FirstName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Soyad gereklidir.")]
        [StringLength(50, MinimumLength = 2, ErrorMessage = "Soyad 2-50 karakter arasında olmalıdır.")]
        [RegularExpression(@"^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$", ErrorMessage = "Soyad sadece harf içerebilir.")]
        public string LastName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email adresi gereklidir.")]
        [EmailAddress(ErrorMessage = "Geçerli bir email adresi girin.")]
        [StringLength(256, ErrorMessage = "Email adresi 256 karakterden uzun olamaz.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre gereklidir.")]
        [StringLength(100, MinimumLength = 8, ErrorMessage = "Şifre 8-100 karakter arasında olmalıdır.")]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$",
            ErrorMessage = "Şifre en az bir küçük harf, bir büyük harf ve bir rakam içermelidir.")]
        public string Password { get; set; } = string.Empty;
    }
}