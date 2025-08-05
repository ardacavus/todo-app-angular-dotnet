using MediatR;
using ToDo.Application.Commands;
using ToDo.Application.Repositories;

namespace ToDo.Application.Handlers
{
    public class DeleteToDoCommandHandler : IRequestHandler<DeleteToDoCommand, Unit>
    {
        private readonly IToDoRepository _repository;

        public DeleteToDoCommandHandler(IToDoRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(DeleteToDoCommand request, CancellationToken cancellationToken)
        {
            var toDo = await _repository.GetByIdAsync(request.Id);

            if (toDo == null)
            {
                throw new KeyNotFoundException($"ToDo with ID {request.Id} not found.");
            }

            _repository.Delete(toDo);
            await _repository.SaveChangesAsync();

            return Unit.Value;
        }
    }
}