using ToDo.WebAPI.Todoproject.Entities.Entity;

namespace ToDo.WebAPI.Todoproject.Entities.Interfaces
{
    public interface IToDoRepository
    {
        Task<List<Todo>> GetAllAsync(CancellationToken ct);
        Task<Todo?> GetByIdAsync(Guid id, CancellationToken ct);
        Task AddAsync(Todo entity, CancellationToken ct);
        Task UpdateAsync(Todo entity, CancellationToken ct);
        Task DeleteAsync(Todo entity, CancellationToken ct);
        Task<int> SaveChangesAsync(CancellationToken ct);
    }
}