using ToDo.Domain.Entities;

namespace ToDo.Application.Repositories
{
    public interface IToDoRepository
    {
        Task<IEnumerable<ToDo.Domain.Entities.ToDo>> GetAllAsync();
        Task<ToDo.Domain.Entities.ToDo?> GetByIdAsync(int id);
        Task AddAsync(ToDo.Domain.Entities.ToDo toDo);
        void Update(ToDo.Domain.Entities.ToDo toDo);
        void Delete(ToDo.Domain.Entities.ToDo toDo);
        Task SaveChangesAsync();
    }
}