namespace ToDo.WebAPI.Todoproject.Entities.ItemDto;

public record ToDoDto(Guid Id, string Title, string? Description, bool IsCompleted, DateTime CreatedAt);
public record CreateToDoRequest(string Title, string? Description, bool IsCompleted);
public record UpdateToDoRequest(string Title, string? Description, bool IsCompleted);
