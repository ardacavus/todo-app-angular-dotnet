import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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

  constructor(private todoService: TodoService) {}

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

  editTodo(todo: Todo): void {
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
      this.error = 'Lütfen bir başlık girin!';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    if (this.editingTodo) {
      // Update existing todo
      const updateRequest: UpdateTodoRequest = {
        title: this.newTodo.title.trim(),
        description: this.newTodo.description?.trim() || '', // Boş string garantisi
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
          console.log('Todo güncellendi:', updated);
        },
        error: (err) => { 
          console.error('Todo güncelleme hatası:', err); 
          this.error = 'Görev güncellenemedi. Lütfen tekrar deneyin.';
          this.loading = false;
        }
      });
    } else {
      // Create new todo
      const createRequest: CreateTodoRequest = {
        title: this.newTodo.title.trim(),
        description: this.newTodo.description?.trim() || '', // Boş string garantisi
        isCompleted: false
      };

      console.log('Todo ekleniyor:', createRequest); // Debug

      this.todoService.createTodo(createRequest).subscribe({
        next: (created) => {
          console.log('Todo eklendi:', created); // Debug
          this.todos.unshift(created);
          this.loading = false;
          this.closeAddDialog();
        },
        error: (err) => { 
          console.error('Todo ekleme hatası:', err); 
          this.error = 'Görev eklenemedi. Lütfen tekrar deneyin.';
          this.loading = false;
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
        this.error = 'Görevler yüklenemedi. Lütfen giriş yapın.'; 
        this.loading = false; 
      }
    });
  }

  toggleTodoCompletion(todo: Todo): void {
    this.error = '';
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
      error: (err) => { 
        console.error('Güncelleme hatası:', err); 
        this.error = 'Görev güncellenemedi. Lütfen tekrar deneyin.'; 
      }
    });
  }

  deleteTodo(id: string): void {
    // Onay dialogu göster
    if (!confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
      return;
    }

    this.error = '';
    this.todoService.deleteTodo(id).subscribe({
      next: () => { 
        this.todos = this.todos.filter(t => t.id !== id); 
      },
      error: (err) => { 
        console.error('Silme hatası:', err); 
        this.error = 'Görev silinemedi. Lütfen tekrar deneyin.'; 
      }
    });
  }
}