using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ToDo.WebAPI.Todoproject.Entities.Entity;

namespace ToDo.WebAPI.Persistence.Configurations;

public class ToDoConfiguration : IEntityTypeConfiguration<Todo>
{
    public void Configure(EntityTypeBuilder<Todo> b)
    {
        b.ToTable("ToDo");               

        b.HasKey(x => x.Id);

        b.Property(x => x.Id)
         .HasColumnType("uniqueidentifier")
         .HasDefaultValueSql("NEWSEQUENTIALID()");  
        b.Property(x => x.Title)
         .IsRequired()
         .HasMaxLength(100);

        b.Property(x => x.Description)
         .HasMaxLength(500)
         .IsRequired(false);

        b.Property(x => x.IsCompleted)
         .IsRequired();

        b.Property(x => x.CreatedAt)
         .HasColumnType("datetime")
         .HasDefaultValueSql("GETDATE()");        
    }
}
