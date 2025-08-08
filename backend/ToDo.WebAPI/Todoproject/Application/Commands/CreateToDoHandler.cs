using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

namespace ToDo.WebAPI.Todoproject.Application.Commands
{
    public interface ICreateToDoHandler
    {
        Task<ToDoDto> HandleAsync(CreateToDoRequest request, CancellationToken ct);
    }

    public class CreateToDoHandler : ICreateToDoHandler
    {
        private readonly IToDoRepository _repo;
        public CreateToDoHandler(IToDoRepository repo) => _repo = repo;

        public async Task<ToDoDto> HandleAsync(CreateToDoRequest req, CancellationToken ct)
        {
            var e = new Entities.Entity.Todo
            {
                Id = Guid.NewGuid(),
                Title = req.Title,
                Description = req.Description,
                IsCompleted = req.IsCompleted
            };

            await _repo.AddAsync(e, ct);
            await _repo.SaveChangesAsync(ct);

            return new ToDoDto(e.Id, e.Title, e.Description, e.IsCompleted, e.CreatedAt);
        }
    }
}
