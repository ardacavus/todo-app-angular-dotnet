import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { Todo, CreateTodoRequest } from '../../models/todo';

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

  constructor(private todoService: TodoService) {}

  ngOnInit(): void {
    this.loadTodos();
  }

  loadTodos(): void {
    this.loading = true;
    this.error = '';
    
    this.todoService.getAllTodos().subscribe({
      next: (todos: Todo[]) => {
        this.todos = todos;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Todo yükleme hatası:', err);
        this.error = 'Backend bağlantısı kurulamadı. Backend çalışıyor mu?';
        this.loading = false;
      }
    });
  }

  addTodo(): void {
    if (!this.newTodo.title.trim()) return;
    
    this.todoService.createTodo(this.newTodo).subscribe({
      next: () => {
        this.newTodo = { title: '', description: '', isCompleted: false };
        this.loadTodos();
      },
      error: (err: any) => {
        console.error('Todo ekleme hatası:', err);
        this.error = 'Todo eklenirken hata oluştu';
      }
    });
  }

  toggleComplete(todo: Todo): void {
    const updateRequest: CreateTodoRequest = {
      title: todo.title,
      description: todo.description,
      isCompleted: !todo.isCompleted
    };

    this.todoService.updateTodo(todo.id, updateRequest).subscribe({
      next: () => {
        this.loadTodos();
      },
      error: (err: any) => {
        console.error('Todo güncelleme hatası:', err);
        this.error = 'Todo güncellenirken hata oluştu';
      }
    });
  }

  deleteTodo(id: string): void {
    if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return;
    
    this.todoService.deleteTodo(id).subscribe({
      next: () => {
        this.loadTodos();
      },
      error: (err: any) => {
        console.error('Todo silme hatası:', err);
        this.error = 'Todo silinirken hata oluştu';
      }
    });
  }
}