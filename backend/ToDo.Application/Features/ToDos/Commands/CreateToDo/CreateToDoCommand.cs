using MediatR;

namespace ToDo.Application.Commands
{
    public class CreateToDoCommand : IRequest<Guid>
    {
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public bool IsCompleted { get; set; } = false;
    }
}