using ToDo.WebAPI.Todoproject.Entities.Interfaces;

namespace ToDo.WebAPI.Todoproject.Application.Commands
{
    public interface IDeleteToDoHandler
    {
        Task<bool> HandleAsync(Guid id, string userId, CancellationToken ct);
    }

    public class DeleteToDoHandler : IDeleteToDoHandler
    {
        private readonly IToDoRepository _repo;

        public DeleteToDoHandler(IToDoRepository repo) => _repo = repo;

        public async Task<bool> HandleAsync(Guid id, string userId, CancellationToken ct)
        {
            var e = await _repo.GetByIdAsync(id, ct);
            if (e is null || e.UserId != userId) return false;

            await _repo.DeleteAsync(e, ct);
            await _repo.SaveChangesAsync(ct);
            return true;
        }
    }
}
