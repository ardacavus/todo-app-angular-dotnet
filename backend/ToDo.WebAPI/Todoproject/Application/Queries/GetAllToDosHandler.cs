using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

namespace ToDo.WebAPI.Todoproject.Application.Queries
{
    public interface IGetAllToDosHandler
    {
        Task<List<ToDoDto>> HandleAsync(string userId, CancellationToken ct);
    }

    public class GetAllToDosHandler : IGetAllToDosHandler
    {
        private readonly IToDoRepository _repo;

        public GetAllToDosHandler(IToDoRepository repo) => _repo = repo;

        public async Task<List<ToDoDto>> HandleAsync(string userId, CancellationToken ct)
        {
            var list = await _repo.GetAllAsync(ct);
            return list
                .Where(e => e.UserId == userId)
                .Select(e => new ToDoDto(e.Id, e.Title, e.Description, e.IsCompleted, e.CreatedAt))
                .ToList();
        }
    }
}