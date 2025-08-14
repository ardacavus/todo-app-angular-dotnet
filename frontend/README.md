# 🖥️ To-Do App Frontend

This is the frontend of the **To-Do List Application**, built with **Angular**.  
It provides a simple and responsive user interface for managing to-do items via the backend API.

---

## 📌 Features
- **Add New Tasks**
- **Edit Existing Tasks**
- **Mark Tasks as Completed**
- **Delete Tasks**
- **List All Tasks**
- **Form Validation & Notifications**
- **Responsive UI with SCSS**

---

## 🛠 Technologies Used
- Angular
- TypeScript
- HTML5
- SCSS
- Angular HttpClient for API requests

---

## 📂 Project Structure
```
src
 ├── app
 │   ├── components
 │   │   ├── app               # Main App Component
 │   │   ├── forgot-password   # Forgot password page
 │   │   ├── login             # Login page
 │   │   ├── notification      # Notifications component
 │   │   ├── registration      # Registration page
 │   │   ├── reset-password    # Password reset page
 │   │   ├── todo-list         # Main to-do list UI
 │   ├── core                  # Core utilities
 │   ├── interceptors          # HTTP interceptors
 │   ├── models                # Data models
 │   ├── services              # API services
 ├── assets
 ├── styles.scss               # Global styles
 ├── index.html
 ├── main.ts
```

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/ardacavus/todo-app-angular-dotnet.git
cd frontend
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure API URL
Edit `environment.ts` to match your backend URL:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:12187/api'
};
```

### 4️⃣ Run the Application
```bash
ng serve
```
Frontend will run by default on:  
[http://localhost:4200](http://localhost:4200)

---

## 📡 API Communication
The frontend communicates with the **.NET Core Web API** backend using Angular's `HttpClient` module.

---

