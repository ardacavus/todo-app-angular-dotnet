using MediatR;
using ToDo.Application.DTOs;

namespace ToDo.Application.Queries
{
    public class GetAllToDosQuery : IRequest<List<ToDoDto>>
    {
    }
}