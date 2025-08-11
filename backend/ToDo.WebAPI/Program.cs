using Microsoft.EntityFrameworkCore;
using ToDo.WebAPI.Persistence.Context;
using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Infrastructure.Repositories;
using ToDo.WebAPI.Todoproject.Application.Commands;
using ToDo.WebAPI.Todoproject.Application.Queries;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;
using ToDo.WebAPI.Todoproject.Entities.Entity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// DbContext
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Authorization
builder.Services.AddAuthorization();

// JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

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
        policy.WithOrigins("http://localhost:4200")
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

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

// Auth endpoints
app.MapPost("/api/auth/register", async (RegisterDto model, UserManager<User> userManager) =>
{
    var user = new User
    {
        UserName = model.Email,
        Email = model.Email,
        FirstName = model.FirstName,
        LastName = model.LastName
    };

    var result = await userManager.CreateAsync(user, model.Password);

    if (!result.Succeeded)
        return Results.BadRequest(result.Errors);

    return Results.Ok(new { message = "Kayýt baþarýlý!" });
});

app.MapPost("/api/auth/login", async (LoginDto model, UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration) =>
{
    var user = await userManager.FindByEmailAsync(model.Email);
    if (user == null)
        return Results.Unauthorized();

    var result = await signInManager.CheckPasswordSignInAsync(user, model.Password, false);
    if (!result.Succeeded)
        return Results.Unauthorized();

    // Generate JWT Token
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new[]
    {
        new Claim(JwtRegisteredClaimNames.Sub, user.Id),
        new Claim(JwtRegisteredClaimNames.Email, user.Email!),
        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
    };

    var token = new JwtSecurityToken(
        issuer: configuration["Jwt:Issuer"],
        audience: configuration["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddDays(30),
        signingCredentials: creds
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new
    {
        token = tokenString,
        user = new
        {
            id = user.Id,
            email = user.Email,
            firstName = user.FirstName,
            lastName = user.LastName
        }
    });
});

// Minimal API endpoint grubu (authentication gerekli)
var api = app.MapGroup("/api/todo").RequireAuthorization();

api.MapGet("/", async (IGetAllToDosHandler h, HttpContext httpContext, CancellationToken ct) =>
{
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

    return Results.Ok(await h.HandleAsync(userId, ct));
});

api.MapGet("/{id:guid}", async (Guid id, IGetToDoByIdHandler h, HttpContext httpContext, CancellationToken ct) =>
{
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

    var dto = await h.HandleAsync(id, userId, ct);
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});

api.MapPost("/", async (CreateToDoRequest req, ICreateToDoHandler h, HttpContext httpContext, CancellationToken ct) =>
{
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

    var dto = await h.HandleAsync(req, userId, ct);
    return Results.Created($"/api/todo/{dto.Id}", dto);
});

api.MapPut("/{id:guid}", async (Guid id, UpdateToDoRequest req, IUpdateToDoHandler h, HttpContext httpContext, CancellationToken ct) =>
{
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

    var dto = await h.HandleAsync(id, req, userId, ct);
    return dto is null ? Results.NotFound() : Results.Ok(dto);
});

api.MapDelete("/{id:guid}", async (Guid id, IDeleteToDoHandler h, HttpContext httpContext, CancellationToken ct) =>
{
    var userId = httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Results.Unauthorized();

    var ok = await h.HandleAsync(id, userId, ct);
    return ok ? Results.NoContent() : Results.NotFound();
});

app.Run();