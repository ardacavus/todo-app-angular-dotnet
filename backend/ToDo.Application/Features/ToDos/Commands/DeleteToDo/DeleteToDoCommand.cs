using MediatR;

namespace ToDo.Application.Commands
{
    public class DeleteToDoCommand : IRequest<Unit>
    {
        public int Id { get; set; }
    }
}