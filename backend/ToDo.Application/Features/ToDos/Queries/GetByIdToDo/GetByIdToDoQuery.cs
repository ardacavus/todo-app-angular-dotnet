using MediatR;
using ToDo.Application.DTOs;

namespace ToDo.Application.Queries
{
    public record GetByIdToDoQuery(int Id) : IRequest<ToDoDto>;
}