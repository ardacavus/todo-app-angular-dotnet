using MediatR;

namespace ToDo.Application.Commands
{
    public class DeleteToDoCommand : IRequest<Unit>
    {
        public Guid Id { get; set; }
    }
}