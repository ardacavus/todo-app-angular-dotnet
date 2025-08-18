using Microsoft.EntityFrameworkCore;
using ToDo.WebAPI.Persistence.Context;
using ToDo.WebAPI.Todoproject.Entities.Entity;
using ToDo.WebAPI.Todoproject.Entities.Interfaces;

namespace ToDo.WebAPI.Infrastructure.Repositories
{
    public class ToDoRepository : IToDoRepository
    {
        private readonly AppDbContext _db;
        public ToDoRepository(AppDbContext db) => _db = db;

        public Task<List<Todo>> GetAllAsync(CancellationToken ct)
            => _db.ToDos.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(ct);

        public Task<Todo?> GetByIdAsync(Guid id, CancellationToken ct)
            => _db.ToDos.FirstOrDefaultAsync(x => x.Id == id, ct);

        public async Task AddAsync(Todo entity, CancellationToken ct)
            => await _db.ToDos.AddAsync(entity, ct);

        public Task UpdateAsync(Todo entity, CancellationToken ct)
        {
            _db.ToDos.Update(entity);
            return Task.CompletedTask;
        }

        public Task DeleteAsync(Todo entity, CancellationToken ct)
        {
            _db.ToDos.Remove(entity);
            return Task.CompletedTask;
        }

        public Task<int> SaveChangesAsync(CancellationToken ct)
            => _db.SaveChangesAsync(ct);
    }
}
