import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../models/todo';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  // Backend'in swagger'daki portunu buraya yaz
  private API_URL = 'https://localhost:12187/api/todo';

  constructor(private http: HttpClient) {}

  // Tüm görevleri al
  getAllTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.API_URL);
  }

  // Tek görev
  getTodoById(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.API_URL}/${id}`);
  }

  // Yeni görev ekle
  createTodo(request: CreateTodoRequest): Observable<Todo> {
    return this.http.post<Todo>(this.API_URL, request);
  }

  // Görev güncelle
  updateTodo(id: string, request: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<Todo>(`${this.API_URL}/${id}`, request);
  }

  // Görev sil
  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
