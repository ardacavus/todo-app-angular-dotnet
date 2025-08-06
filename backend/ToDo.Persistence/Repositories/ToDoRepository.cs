using Microsoft.EntityFrameworkCore;
using ToDo.Application.Repositories;
using ToDo.Persistence.Contexts;

namespace ToDo.Persistence.Repositories
{
    public class ToDoRepository : IToDoRepository
    {
        private readonly AppDbContext _context;

        public ToDoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<ToDo.Domain.Entities.ToDo>> GetAllAsync()
        {
            return await _context.ToDos.ToListAsync();
        }

        public async Task<ToDo.Domain.Entities.ToDo?> GetByIdAsync(Guid id)
        {
            return await _context.ToDos.FindAsync(id);
        }

        public async Task AddAsync(ToDo.Domain.Entities.ToDo toDo)
        {
            await _context.ToDos.AddAsync(toDo);
        }

        public void Update(ToDo.Domain.Entities.ToDo toDo)
        {
            _context.ToDos.Update(toDo);
        }

        public void Delete(ToDo.Domain.Entities.ToDo toDo)
        {
            _context.ToDos.Remove(toDo);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}