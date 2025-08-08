using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

namespace ToDo.WebAPI.Todoproject.Application.Commands
{
    public interface IUpdateToDoHandler
    {
        Task<ToDoDto?> HandleAsync(Guid id, UpdateToDoRequest request, CancellationToken ct);
    }

    public class UpdateToDoHandler : IUpdateToDoHandler
    {
        private readonly IToDoRepository _repo;
        public UpdateToDoHandler(IToDoRepository repo) => _repo = repo;

        public async Task<ToDoDto?> HandleAsync(Guid id, UpdateToDoRequest req, CancellationToken ct)
        {
            var e = await _repo.GetByIdAsync(id, ct);
            if (e is null) return null;

            e.Title = req.Title;
            e.Description = req.Description;
            e.IsCompleted = req.IsCompleted;

            await _repo.UpdateAsync(e, ct);
            await _repo.SaveChangesAsync(ct);

            return new ToDoDto(e.Id, e.Title, e.Description, e.IsCompleted, e.CreatedAt);
        }
    }
}
