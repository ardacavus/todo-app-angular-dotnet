using Microsoft.EntityFrameworkCore;
using ToDo.WebAPI.Persistence.Context;
using ToDo.WebAPI.Application.Interfaces.Repositories;
using ToDo.WebAPI.Infrastructure.Repositories;
using ToDo.WebAPI.Todoproject.Application.Commands;
using ToDo.WebAPI.Todoproject.Application.Queries;
using ToDo.WebAPI.Todoproject.Entities.ItemDto;
using ToDo.WebAPI.Todoproject.Entities.Entity;
using ToDo.WebAPI.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

builder.Services.AddAuthorization();

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

builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddScoped<IToDoRepository, ToDoRepository>();
builder.Services.AddScoped<ICreateToDoHandler, CreateToDoHandler>();
builder.Services.AddScoped<IUpdateToDoHandler, UpdateToDoHandler>();
builder.Services.AddScoped<IDeleteToDoHandler, DeleteToDoHandler>();
builder.Services.AddScoped<IGetAllToDosHandler, GetAllToDosHandler>();
builder.Services.AddScoped<IGetToDoByIdHandler, GetToDoByIdHandler>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/api/auth/register", async (RegisterDto model, UserManager<User> userManager) =>
{
    var existingUser = await userManager.FindByEmailAsync(model.Email);
    if (existingUser != null)
    {
        return Results.BadRequest(new { message = "Bu e-posta adresi ile daha önce kayýt olunmuþ!" });
    }

    var user = new User
    {
        UserName = model.Email,
        Email = model.Email,
        FirstName = model.FirstName,
        LastName = model.LastName
    };

    var result = await userManager.CreateAsync(user, model.Password);

    if (!result.Succeeded)
    {
        var errors = string.Join(", ", result.Errors.Select(e => e.Description));
        return Results.BadRequest(new { message = $"Kayýt iþlemi baþarýsýz: {errors}" });
    }

    return Results.Ok(new { message = "Kayýt baþarýlý!" });
});

app.MapPost("/api/auth/login", async (LoginDto model, UserManager<User> userManager, SignInManager<User> signInManager, IConfiguration configuration) =>
{
    var user = await userManager.FindByEmailAsync(model.Email);
    if (user == null)
    {
        return Results.BadRequest(new { message = "Bu e-posta adresi ile kayýtlý kullanýcý bulunamadý!" });
    }

    var result = await signInManager.CheckPasswordSignInAsync(user, model.Password, false);
    if (!result.Succeeded)
    {
        return Results.BadRequest(new { message = "Þifre hatalý!" });
    }

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

app.MapPost("/api/auth/forgot-password", async (
    ForgotPasswordDto model,
    UserManager<User> userManager,
    IEmailService emailService,
    ILogger<Program> logger) =>
{
    logger.LogInformation($"Forgot password request for email: {model.Email}");

    var user = await userManager.FindByEmailAsync(model.Email);
    if (user == null)
    {
        logger.LogWarning($"User not found for email: {model.Email}");
        return Results.Ok(new { message = "Eðer email adresiniz sistemde kayýtlýysa, þifre sýfýrlama linki gönderilmiþtir." });
    }

    logger.LogInformation($"User found: {user.FirstName} {user.LastName}");

    var today = DateTime.UtcNow.Date;
    if (user.LastPasswordResetRequest?.Date == today && user.PasswordResetRequestCount >= 3)
    {
        logger.LogWarning($"Rate limit exceeded for user: {model.Email}");
        return Results.BadRequest(new { message = "Günde sadece 3 kere þifre sýfýrlama talebinde bulunabilirsiniz." });
    }

    if (user.LastPasswordResetRequest?.Date != today)
    {
        user.PasswordResetRequestCount = 0;
    }
    user.LastPasswordResetRequest = DateTime.UtcNow;
    user.PasswordResetRequestCount++;
    await userManager.UpdateAsync(user);

    logger.LogInformation($"Password reset request count: {user.PasswordResetRequestCount}/3");

    logger.LogInformation("Generating password reset token...");
    var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
    logger.LogInformation($"Token generated successfully. Length: {resetToken.Length}");

    try
    {
        logger.LogInformation($"Attempting to send email to: {model.Email}");
        logger.LogInformation($"User name: {user.FirstName}");

        await emailService.SendPasswordResetEmailAsync(user.Email!, resetToken, user.FirstName);

        logger.LogInformation("Email sent successfully!");
        return Results.Ok(new { message = "Þifre sýfýrlama linki email adresinize gönderildi." });
    }
    catch (Exception ex)
    {
        logger.LogError($"Email gönderme hatasý: {ex.Message}");
        logger.LogError($"Inner exception: {ex.InnerException?.Message}");
        logger.LogError($"Stack trace: {ex.StackTrace}");
        return Results.BadRequest(new { message = $"Email gönderiminde sorun oluþtu: {ex.Message}" });
    }
});

app.MapPost("/api/auth/reset-password", async (
    ResetPasswordDto model,
    UserManager<User> userManager) =>
{
    var user = await userManager.FindByEmailAsync(model.Email);
    if (user == null)
    {
        return Results.BadRequest(new { message = "Geçersiz iþlem." });
    }

    var result = await userManager.ResetPasswordAsync(user, model.Token, model.NewPassword);
    if (!result.Succeeded)
    {
        return Results.BadRequest(new { message = "Þifre sýfýrlama baþarýsýz. Token geçersiz veya süresi dolmuþ." });
    }

    return Results.Ok(new { message = "Þifreniz baþarýyla sýfýrlandý." });
});

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