using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

namespace ToDo.WebAPI.Todoproject.Application.Queries
{
    public interface IGetToDoByIdHandler
    {
        Task<ToDoDto?> HandleAsync(Guid id, string userId, CancellationToken ct);
    }

    public class GetToDoByIdHandler : IGetToDoByIdHandler
    {
        private readonly IToDoRepository _repo;

        public GetToDoByIdHandler(IToDoRepository repo) => _repo = repo;

        public async Task<ToDoDto?> HandleAsync(Guid id, string userId, CancellationToken ct)
        {
            var e = await _repo.GetByIdAsync(id, ct);
            if (e is null || e.UserId != userId) return null;

            return new ToDoDto(e.Id, e.Title, e.Description, e.IsCompleted, e.CreatedAt);
        }
    }
}