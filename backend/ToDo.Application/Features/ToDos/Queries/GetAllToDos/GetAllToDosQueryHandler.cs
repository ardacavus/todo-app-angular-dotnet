using MediatR;
using ToDo.Application.DTOs;
using ToDo.Application.Queries;
using ToDo.Application.Repositories;

namespace ToDo.Application.Handlers
{
    public class GetAllToDosQueryHandler : IRequestHandler<GetAllToDosQuery, List<ToDoDto>>
    {
        private readonly IToDoRepository _repository;

        public GetAllToDosQueryHandler(IToDoRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<ToDoDto>> Handle(GetAllToDosQuery request, CancellationToken cancellationToken)
        {
            var toDos = await _repository.GetAllAsync();

            var toDoDtos = toDos.Select(todo => new ToDoDto
            {
                Id = todo.Id,
                Title = todo.Title,
                Description = todo.Description,
                IsCompleted = todo.IsCompleted,
                CreatedAt = todo.CreatedAt
            }).ToList();

            return toDoDtos;
        }
    }
}