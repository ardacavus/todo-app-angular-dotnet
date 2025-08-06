using MediatR;
using ToDo.Application.DTOs;
using ToDo.Application.Queries;
using ToDo.Application.Repositories;

namespace ToDo.Application.QueryHandlers
{
    public class GetByIdToDoQueryHandler : IRequestHandler<GetByIdToDoQuery, ToDoDto>
    {
        private readonly IToDoRepository _repository;

        public GetByIdToDoQueryHandler(IToDoRepository repository)
        {
            _repository = repository;
        }

        public async Task<ToDoDto> Handle(GetByIdToDoQuery request, CancellationToken cancellationToken)
        {
            var toDo = await _repository.GetByIdAsync(request.Id);

            if (toDo == null)
            {
                throw new KeyNotFoundException($"ToDo with ID {request.Id} not found.");
            }

            var toDoDto = new ToDoDto
            {
                Id = toDo.Id,
                Title = toDo.Title,
                Description = toDo.Description,
                IsCompleted = toDo.IsCompleted,
                CreatedAt = toDo.CreatedAt
            };

            return toDoDto;
        }
    }
}