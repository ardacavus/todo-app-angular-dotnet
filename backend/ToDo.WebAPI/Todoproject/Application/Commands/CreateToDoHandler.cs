using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

namespace ToDo.WebAPI.Todoproject.Application.Commands
{
    public interface ICreateToDoHandler
    {
        Task<ToDoDto> HandleAsync(CreateToDoRequest request, string userId, CancellationToken ct);
    }

    public class CreateToDoHandler : ICreateToDoHandler
    {
        private readonly IToDoRepository _repo;

        public CreateToDoHandler(IToDoRepository repo) => _repo = repo;

        public async Task<ToDoDto> HandleAsync(CreateToDoRequest req, string userId, CancellationToken ct)
        {
            if (string.IsNullOrWhiteSpace(req.Title))
                throw new ArgumentException("Title is required.", nameof(req.Title));

            var entity = new Entities.Entity.Todo
            {
                Title = req.Title.Trim(),
                Description = string.IsNullOrWhiteSpace(req.Description) ? null : req.Description!.Trim(),
                IsCompleted = req.IsCompleted,
                UserId = userId
            };

            await _repo.AddAsync(entity, ct);
            await _repo.SaveChangesAsync(ct);

            return new ToDoDto(
                entity.Id,
                entity.Title,
                entity.Description,
                entity.IsCompleted,
                entity.CreatedAt
            );
        }
    }
}