using Microsoft.EntityFrameworkCore;
using ToDo.WebAPI.Persistence.Context;
using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Infrastructure.Repositories;
using ToDo.WebAPI.Todoproject.Application.Commands;
using ToDo.WebAPI.Todoproject.Application.Queries;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Dependency Injection
builder.Services.AddScoped<IToDoRepository, ToDoRepository>();
builder.Services.AddScoped<ICreateToDoHandler, CreateToDoHandler>();
builder.Services.AddScoped<IUpdateToDoHandler, UpdateToDoHandler>();
builder.Services.AddScoped<IDeleteToDoHandler, DeleteToDoHandler>();
builder.Services.AddScoped<IGetAllToDosHandler, GetAllToDosHandler>();
builder.Services.AddScoped<IGetToDoByIdHandler, GetToDoByIdHandler>();

// Swagger servisleri
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS ekle
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:4200") // Angular dev server adresi
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Swagger middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// CORS aktif et
app.UseCors("AllowFrontend");

// Minimal API endpoint grubu
var api = app.MapGroup("/api/todo");

api.MapGet("/", async (IGetAllToDosHandler h, CancellationToken ct)
    => Results.Ok(await h.HandleAsync(ct)));

api.MapGet("/{id:guid}", async (Guid id, IGetToDoByIdHandler h, CancellationToken ct) =>
{
    var dto = await h.HandleAsync(id, ct);
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});

api.MapPost("/", async (CreateToDoRequest req, ICreateToDoHandler h, CancellationToken ct) =>
{
    var dto = await h.HandleAsync(req, ct);
    return Results.Created($"/api/todo/{dto.Id}", dto);
});

api.MapPut("/{id:guid}", async (Guid id, UpdateToDoRequest req, IUpdateToDoHandler h, CancellationToken ct) =>
{
    var dto = await h.HandleAsync(id, req, ct);
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});

api.MapDelete("/{id:guid}", async (Guid id, IDeleteToDoHandler h, CancellationToken ct) =>
{
    var ok = await h.HandleAsync(id, ct);
    return ok ? Results.NoContent() : Results.NotFound();
});

app.Run();
