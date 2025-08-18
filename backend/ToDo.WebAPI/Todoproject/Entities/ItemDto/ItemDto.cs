using System.ComponentModel.DataAnnotations;

namespace ToDo.WebAPI.Todoproject.Entities.ItemDto
{
    public record ToDoDto(
        Guid Id,
        string Title,
        string? Description,
        bool IsCompleted,
        DateTime CreatedAt
    );

    public record CreateToDoRequest(
        [Required(ErrorMessage = "Başlık gereklidir.")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Başlık 1-200 karakter arasında olmalıdır.")]
        string Title,

        [StringLength(1000, ErrorMessage = "Açıklama 1000 karakterden uzun olamaz.")]
        string? Description,

        bool IsCompleted = false
    );

    public record UpdateToDoRequest(
        [Required(ErrorMessage = "Başlık gereklidir.")]
        [StringLength(200, MinimumLength = 1, ErrorMessage = "Başlık 1-200 karakter arasında olmalıdır.")]
        string Title,

        [StringLength(1000, ErrorMessage = "Açıklama 1000 karakterden uzun olamaz.")]
        string? Description,

        bool IsCompleted
    );
}