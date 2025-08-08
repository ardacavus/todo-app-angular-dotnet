using Microsoft.EntityFrameworkCore;
using ToDo.WebAPI.Todoproject.Entities.Entity;

namespace ToDo.WebAPI.Persistence.Context;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Todo> ToDos => Set<Todo>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
        => modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
}
