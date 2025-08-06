using MediatR;
using ToDo.Application.DTOs;

namespace ToDo.Application.Queries
{
    public record GetByIdToDoQuery(Guid Id) : IRequest<ToDoDto>;
}