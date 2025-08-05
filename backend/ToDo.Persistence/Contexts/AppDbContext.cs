using Microsoft.EntityFrameworkCore;

namespace ToDo.Persistence.Contexts
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<ToDo.Domain.Entities.ToDo> ToDos { get; set; }
    }
}