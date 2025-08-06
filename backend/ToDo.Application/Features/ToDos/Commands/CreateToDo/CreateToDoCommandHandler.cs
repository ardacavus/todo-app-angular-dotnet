using MediatR;
using ToDo.Application.Commands;
using ToDo.Application.Repositories;

namespace ToDo.Application.CommandHandlers
{
    public class CreateToDoCommandHandler : IRequestHandler<CreateToDoCommand, Guid>
    {
        private readonly IToDoRepository _repository;

        public CreateToDoCommandHandler(IToDoRepository repository)
        {
            _repository = repository;
        }

        public async Task<Guid> Handle(CreateToDoCommand request, CancellationToken cancellationToken)
        {
            var toDo = new ToDo.Domain.Entities.ToDo
            {
                Id = Guid.NewGuid(),
                Title = request.Title,
                Description = request.Description,
                IsCompleted = request.IsCompleted,
                CreatedAt = DateTime.Now
            };

            await _repository.AddAsync(toDo);
            await _repository.SaveChangesAsync();

            return toDo.Id;
        }
    }
}