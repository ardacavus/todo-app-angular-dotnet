using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

namespace ToDo.WebAPI.Todoproject.Application.Queries
{
    public interface IGetAllToDosHandler
    {
        Task<List<ToDoDto>> HandleAsync(CancellationToken ct);
    }

    public class GetAllToDosHandler : IGetAllToDosHandler
    {
        private readonly IToDoRepository _repo;
        public GetAllToDosHandler(IToDoRepository repo) => _repo = repo;

        public async Task<List<ToDoDto>> HandleAsync(CancellationToken ct)
        {
            var list = await _repo.GetAllAsync(ct);
            return list.Select(e => new ToDoDto(e.Id, e.Title, e.Description, e.IsCompleted, e.CreatedAt)).ToList();
        }
    }
}
