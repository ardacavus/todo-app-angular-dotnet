import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TodoService } from '../../services/todo.service';
import { NotificationService } from '../../services/notification.service';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../../models/todo';

type Filter = 'all' | 'active' | 'completed';

@Component({
  selector: 'app-todo-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo-list.component.html',
  styleUrls: ['./todo-list.component.scss']
})
export class TodoListComponent implements OnInit, AfterViewInit {
  @ViewChild('titleInput') titleInput!: ElementRef;

  todos: Todo[] = [];
  loading = false;
  error = '';
  showAddDialog = false;
  editingTodo: Todo | null = null;

  newTodo: CreateTodoRequest = {
    title: '',
    description: '',
    isCompleted: false
  };

  filter: Filter = 'all';

  constructor(
    private todoService: TodoService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void { 
    this.loadTodos(); 
  }

  ngAfterViewInit(): void {
    // Modal açıldığında input'a focus ver
  }

  get totalCount(): number { 
    return this.todos.length; 
  }
  
  get activeCount(): number { 
    return this.todos.filter(t => !t.isCompleted).length; 
  }
  
  get completedCount(): number { 
    return this.todos.filter(t => t.isCompleted).length; 
  }

  setFilter(f: Filter) { 
    this.filter = f; 
  }

  filteredTodos(): Todo[] {
    switch (this.filter) {
      case 'active': return this.todos.filter(t => !t.isCompleted);
      case 'completed': return this.todos.filter(t => t.isCompleted);
      default: return this.todos;
    }
  }

  getEmptyMessage(): string {
    switch (this.filter) {
      case 'active': return 'Tüm görevlerin tamamlanmış! 🎉';
      case 'completed': return 'Henüz tamamlanmış görev yok.';
      default: return 'İlk görevini ekleyerek başla!';
    }
  }

  // Modal Methods
  openAddDialog(): void {
    this.showAddDialog = true;
    this.editingTodo = null;
    this.resetForm();
    
    // Input'a focus vermek için setTimeout kullan
    setTimeout(() => {
      if (this.titleInput) {
        this.titleInput.nativeElement.focus();
      }
    }, 100);
  }

  editTodo(todo: Todo, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    this.showAddDialog = true;
    this.editingTodo = todo;
    this.newTodo = {
      title: todo.title,
      description: todo.description,
      isCompleted: todo.isCompleted
    };

    setTimeout(() => {
      if (this.titleInput) {
        this.titleInput.nativeElement.focus();
        this.titleInput.nativeElement.select();
      }
    }, 100);
  }

  closeAddDialog(): void {
    this.showAddDialog = false;
    this.editingTodo = null;
    this.resetForm();
  }

  resetForm(): void {
    this.newTodo = {
      title: '',
      description: '', // Boş string olarak initialize et
      isCompleted: false
    };
  }

  onSubmit(): void {
    if (!this.newTodo.title.trim()) {
      this.notificationService.warning(
        'Eksik Bilgi',
        'Lütfen bir görev başlığı girin.'
      );
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    if (this.editingTodo) {
      // Update existing todo
      const updateRequest: UpdateTodoRequest = {
        title: this.newTodo.title.trim(),
        description: this.newTodo.description?.trim() || '',
        isCompleted: this.newTodo.isCompleted
      };

      this.todoService.updateTodo(this.editingTodo.id, updateRequest).subscribe({
        next: (updated) => {
          const index = this.todos.findIndex(t => t.id === this.editingTodo!.id);
          if (index > -1) {
            this.todos[index] = updated;
          }
          this.loading = false;
          this.closeAddDialog();
          
          // Success notification
          this.notificationService.success(
            'Görev Güncellendi!',
            `"${updated.title}" başarıyla güncellendi.`
          );
        },
        error: (err) => { 
          console.error('Todo güncelleme hatası:', err);
          this.loading = false;
          
          // Error notification
          this.notificationService.error(
            'Güncelleme Hatası',
            'Görev güncellenirken bir hata oluştu.',
            err.error?.message || err.message
          );
        }
      });
    } else {
      // Create new todo
      const createRequest: CreateTodoRequest = {
        title: this.newTodo.title.trim(),
        description: this.newTodo.description?.trim() || '',
        isCompleted: false
      };

      this.todoService.createTodo(createRequest).subscribe({
        next: (created) => {
          this.todos.unshift(created);
          this.loading = false;
          this.closeAddDialog();
          
          // Success notification
          this.notificationService.success(
            'Görev Eklendi!',
            `"${created.title}" başarıyla eklendi.`
          );
        },
        error: (err) => { 
          console.error('Todo ekleme hatası:', err);
          this.loading = false;
          
          // Error notification
          this.notificationService.error(
            'Görev Eklenemedi',
            'Görev eklenirken bir hata oluştu.',
            err.error?.message || err.message
          );
        }
      });
    }
  }

  loadTodos(): void {
    this.loading = true;
    this.error = '';
    
    this.todoService.getAllTodos().subscribe({
      next: (todos) => { 
        this.todos = todos; 
        this.loading = false; 
      },
      error: (err) => { 
        console.error('Todo yükleme hatası:', err);
        this.loading = false;
        
        // Error notification for loading
        this.notificationService.error(
          'Yükleme Hatası',
          'Görevler yüklenirken bir hata oluştu. Lütfen giriş yapın.',
          err.error?.message || err.message
        );
      }
    });
  }

  toggleTodoCompletion(todo: Todo, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    const body: UpdateTodoRequest = {
      title: todo.title,
      description: todo.description,
      isCompleted: !todo.isCompleted
    };
    
    this.todoService.updateTodo(todo.id, body).subscribe({
      next: (updated) => {
        const i = this.todos.findIndex(t => t.id === todo.id);
        if (i > -1) this.todos[i] = updated;
        
        // Success notification for completion toggle
        const actionText = updated.isCompleted ? 'tamamlandı' : 'aktif hale getirildi';
        this.notificationService.success(
          'Görev Güncellendi',
          `"${updated.title}" ${actionText}.`
        );
      },
      error: (err) => { 
        console.error('Güncelleme hatası:', err);
        
        // Error notification
        this.notificationService.error(
          'Güncelleme Hatası',
          'Görev durumu değiştirilemedi.',
          err.error?.message || err.message
        );
      }
    });
  }

  deleteTodo(id: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    // Use notification service for confirmation
    this.notificationService.confirmDelete(
      todo.title,
      () => this.executeDelete(id)
    );
  }

  private executeDelete(id: string): void {
    this.todoService.deleteTodo(id).subscribe({
      next: () => { 
        this.todos = this.todos.filter(t => t.id !== id);
        
        // Success notification
        this.notificationService.success(
          'Görev Silindi',
          'Görev başarıyla silindi.'
        );
      },
      error: (err) => { 
        console.error('Silme hatası:', err);
        
        // Error notification
        this.notificationService.error(
          'Silme Hatası',
          'Görev silinirken bir hata oluştu.',
          err.error?.message || err.message
        );
      }
    });
  }
}
