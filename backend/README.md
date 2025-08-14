📝 To-Do App Backend

This is the backend service for the To-Do List Application, built with .NET Core and Entity Framework Core following the CQRS pattern.
It provides RESTful APIs for managing to-do items, storing data in an MSSQL Server database.

📌 Features

CQRS Architecture (Command & Query Separation)

CRUD Operations (Create, Read, Update, Delete)

Repository Pattern

Entity Framework Core with MSSQL

Swagger API Documentation

Clean Code & Layered Architecture

🛠 Technologies Used

.NET 8 Web API

Entity Framework Core

MSSQL Server

CQRS Pattern

Repository Pattern

Swagger / Swashbuckle

Dependency Injection

📂 Project Structure
ToDo.WebAPI
 ├── Migrations
 ├── Todoproject
 │   ├── Application        # Commands & Queries
 │   ├── Entities           # Entity classes
 │   ├── Infrastructure     # Cross-cutting concerns
 │   ├── Persistence        # EF Core DbContext & Configurations
 │   ├── Services           # Business logic services
 ├── appsettings.json
 ├── Program.cs

⚙️ Setup Instructions
1️⃣ Clone the Repository
git clone https://github.com/ardacavus/todo-app-angular-dotnet.git
cd backend

2️⃣ Configure the Database

Edit appsettings.json with your MSSQL connection string:

"ConnectionStrings": {
  "DefaultConnection": "Server=YOUR_SERVER;Database=TodoDb;Trusted_Connection=True;TrustServerCertificate=True;"
}

3️⃣ Apply EF Core Migrations
dotnet ef database update

4️⃣ Run the Application
dotnet run


The backend will run by default on:

https://localhost:12187

📡 API Endpoints
Method	Endpoint	Description
GET	/api/todo	Get all to-dos
GET	/api/todo/{id}	Get a to-do by ID
POST	/api/todo	Create a new to-do
PUT	/api/todo/{id}	Update an existing to-do
DELETE	/api/todo/{id}	Delete a to-do
🔍 Example Request (Create To-Do)
POST /api/todo
Content-Type: application/json

{
  "title": "Finish backend README",
  "description": "Write a detailed backend documentation",
  "isCompleted": false
}
