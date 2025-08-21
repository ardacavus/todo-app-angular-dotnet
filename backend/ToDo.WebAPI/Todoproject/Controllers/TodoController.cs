using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using System.Security.Claims;
using ToDo.WebAPI.Todoproject.Application.Commands;
using ToDo.WebAPI.Todoproject.Application.Queries;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

namespace ToDo.WebAPI.Todoproject.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [EnableRateLimiting("GeneralPolicy")]
    public class TodoController : ControllerBase
    {
        private readonly IGetAllToDosHandler _getAllToDosHandler;
        private readonly IGetToDoByIdHandler _getToDoByIdHandler;
        private readonly ICreateToDoHandler _createToDoHandler;
        private readonly IUpdateToDoHandler _updateToDoHandler;
        private readonly IDeleteToDoHandler _deleteToDoHandler;

        public TodoController(
            IGetAllToDosHandler getAllToDosHandler,
            IGetToDoByIdHandler getToDoByIdHandler,
            ICreateToDoHandler createToDoHandler,
            IUpdateToDoHandler updateToDoHandler,
            IDeleteToDoHandler deleteToDoHandler)
        {
            _getAllToDosHandler = getAllToDosHandler;
            _getToDoByIdHandler = getToDoByIdHandler;
            _createToDoHandler = createToDoHandler;
            _updateToDoHandler = updateToDoHandler;
            _deleteToDoHandler = deleteToDoHandler;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllTodos(CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var todos = await _getAllToDosHandler.HandleAsync(userId, cancellationToken);
            return Ok(todos);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetTodoById(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var todo = await _getToDoByIdHandler.HandleAsync(id, userId, cancellationToken);
            return todo is null ? NotFound() : Ok(todo);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTodo([FromBody] CreateToDoRequest request, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var todo = await _createToDoHandler.HandleAsync(request, userId, cancellationToken);
            return CreatedAtAction(nameof(GetTodoById), new { id = todo.Id }, todo);
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> UpdateTodo(Guid id, [FromBody] UpdateToDoRequest request, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var todo = await _updateToDoHandler.HandleAsync(id, request, userId, cancellationToken);
            return todo is null ? NotFound() : Ok(todo);
        }

        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> DeleteTodo(Guid id, CancellationToken cancellationToken)
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var success = await _deleteToDoHandler.HandleAsync(id, userId, cancellationToken);
            return success ? NoContent() : NotFound();
        }

        private string? GetUserId()
        {
            return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
    }
}