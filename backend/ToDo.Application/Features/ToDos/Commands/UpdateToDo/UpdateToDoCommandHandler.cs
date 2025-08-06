using MediatR;
using ToDo.Application.Commands;
using ToDo.Application.Repositories;

namespace ToDo.Application.CommandHandlers
{
    public class UpdateToDoCommandHandler : IRequestHandler<UpdateToDoCommand, Unit>
    {
        private readonly IToDoRepository _repository;

        public UpdateToDoCommandHandler(IToDoRepository repository)
        {
            _repository = repository;
        }

        public async Task<Unit> Handle(UpdateToDoCommand request, CancellationToken cancellationToken)
        {
            var toDo = await _repository.GetByIdAsync(request.Id);

            if (toDo == null)
            {
                throw new KeyNotFoundException($"ToDo with ID {request.Id} not found.");
            }

            toDo.Title = request.Title;
            toDo.Description = request.Description;
            toDo.IsCompleted = request.IsCompleted;

            _repository.Update(toDo);
            await _repository.SaveChangesAsync();

            return Unit.Value;
        }
    }
}