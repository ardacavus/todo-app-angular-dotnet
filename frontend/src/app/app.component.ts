import { Component } from '@angular/core';
import { TodoListComponent } from './components/todo-list/todo-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [TodoListComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>📝 ToDo List App</h1>
        <p>Angular + .NET Core ile yapılmış basit görev yöneticisi</p>
      </header>
      
      <main class="app-main">
        <app-todo-list></app-todo-list>
      </main>
      
      <footer class="app-footer">
        <p>Made with ❤️ using Angular & .NET Core</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .app-header {
      text-align: center;
      padding: 2rem;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }

    .app-header h1 {
      margin: 0;
      font-size: 2.5rem;
      font-weight: 300;
    }

    .app-header p {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
      font-size: 1.1rem;
    }

    .app-main {
      padding: 0 1rem 2rem 1rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .app-footer {
      text-align: center;
      padding: 1rem;
      color: white;
      opacity: 0.7;
    }

    @media (max-width: 768px) {
      .app-header h1 {
        font-size: 2rem;
      }
      
      .app-main {
        padding: 0 0.5rem 2rem 0.5rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'ToDo App';
}