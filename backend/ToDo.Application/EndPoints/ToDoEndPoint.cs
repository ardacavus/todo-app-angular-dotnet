using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Runtime.InteropServices;
using ToDo.Application.Commands;
using ToDo.Application.DTOs;
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

        [HttpGet("{id:int}")]
        public async Task<ActionResult<ToDoDto>> GetById(int id)
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
        public async Task<ActionResult<int>> CreateToDo([FromBody] CreateToDoCommand command)
        {
            var id = await _mediator.Send(command);
            return Ok(id);
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateToDo(int id, [FromBody] UpdateToDoCommand command)
        {
            command.Id = id;
            await _mediator.Send(command);
            return NoContent();
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteToDo(int id)
        {
            var command = new DeleteToDoCommand { Id = id };
            await _mediator.Send(command);
            return NoContent();
        }
    }
}