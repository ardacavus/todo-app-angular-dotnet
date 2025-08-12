using Microsoft.AspNetCore.Identity;

namespace ToDo.WebAPI.Todoproject.Entities.Entity
{
    public class User : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastPasswordResetRequest { get; set; }
        public int PasswordResetRequestCount { get; set; } = 0;
    }
}