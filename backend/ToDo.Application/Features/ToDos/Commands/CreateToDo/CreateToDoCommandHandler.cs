using MediatR;
using ToDo.Application.Commands;
using ToDo.Application.Repositories;

namespace ToDo.Application.Handlers
{
    public class CreateToDoCommandHandler : IRequestHandler<CreateToDoCommand, int>
    {
        private readonly IToDoRepository _repository;

        public CreateToDoCommandHandler(IToDoRepository repository)
        {
            _repository = repository;
        }

        public async Task<int> Handle(CreateToDoCommand request, CancellationToken cancellationToken)
        {
            var toDo = new ToDo.Domain.Entities.ToDo
            {
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