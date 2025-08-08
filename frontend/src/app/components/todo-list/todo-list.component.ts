import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../models/todo';

type Filter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit {
  todos: Todo[] = [];
  loading = false;
  error = '';

  newTodo: CreateTodoRequest = {
    title: '',
    description: '',
    isCompleted: false
  };

  filter: Filter = 'all';

  constructor(private todoService: TodoService) {}

  ngOnInit(): void { this.loadTodos(); }

  // ---- Counters for template (no arrow functions in HTML)
  get totalCount(): number { return this.todos.length; }
  get activeCount(): number { return this.todos.filter(t => !t.isCompleted).length; }
  get completedCount(): number { return this.todos.filter(t => t.isCompleted).length; }

  setFilter(f: Filter) { this.filter = f; }

  filteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active': return this.todos.filter(t => !t.isCompleted);
      case 'completed': return this.todos.filter(t => t.isCompleted);
      default: return this.todos;
    }
  }

  loadTodos(): void {
    this.loading = true;
    this.todoService.getAllTodos().subscribe({
      next: (todos) => { this.todos = todos; this.loading = false; },
      error: (err) => { console.error('Todo yükleme hatası:', err); this.error = 'Görevler yüklenemedi'; this.loading = false; }
    });
  }

  addTodo(): void {
    if (!this.newTodo.title.trim()) return;
    this.todoService.createTodo(this.newTodo).subscribe({
      next: (created) => {
        this.todos.unshift(created);
        this.newTodo = { title: '', description: '', isCompleted: false };
      },
      error: (err) => { console.error('Todo ekleme hatası:', err); this.error = 'Görev eklenemedi'; }
    });
  }

  toggleTodoCompletion(todo: Todo): void {
    const body: UpdateTodoRequest = {
      title: todo.title,
      description: todo.description,
      isCompleted: !todo.isCompleted
    };
    this.todoService.updateTodo(todo.id, body).subscribe({
      next: (updated) => {
        const i = this.todos.findIndex(t => t.id === todo.id);
        if (i > -1) this.todos[i] = updated;
      },
      error: (err) => { console.error('Güncelleme hatası:', err); this.error = 'Görev güncellenemedi'; }
    });
  }

  deleteTodo(id: string): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => { this.todos = this.todos.filter(t => t.id !== id); },
      error: (err) => { console.error('Silme hatası:', err); this.error = 'Görev silinemedi'; }
    });
  }
}
