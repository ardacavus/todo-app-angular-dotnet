using MediatR;
using Microsoft.AspNetCore.Mvc;
using ToDo.Application.DTOs;
using ToDo.Application.Commands;
using ToDo.Application.Queries;

namespace ToDo.Application.Endpoints
{
    [ApiController]
    [Route("api/todo")]
    public class ToDoEndpoint : ControllerBase
    {
        private readonly IMediator _mediator;

        public ToDoEndpoint(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<ActionResult<List<ToDoDto>>> GetAllToDos()
        {
            var query = new GetAllToDosQuery();
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<ToDoDto>> GetById(Guid id)
        {
            try
            {
                var query = new GetByIdToDoQuery(id);
                var result = await _mediator.Send(query);
                return Ok(result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpPost]
        public async Task<ActionResult<Guid>> CreateToDo([FromBody] CreateToDoCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(id);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateToDo(Guid id, [FromBody] UpdateToDoCommand command)
        {
            command.Id = id;
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteToDo(Guid id)
        {
            var command = new DeleteToDoCommand { Id = id };
            await _mediator.Send(command);
            return NoContent();
        }
    }
}