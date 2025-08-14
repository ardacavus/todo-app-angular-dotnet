import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Todo, CreateTodoRequest, UpdateTodoRequest } from '../models/todo';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TodoService {
  private API_URL = 'https://localhost:12187/api/todo';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAllTodos(): Observable<Todo[]> {
    return this.http.get<Todo[]>(this.API_URL, { headers: this.getHeaders() });
  }

  getTodoById(id: string): Observable<Todo> {
    return this.http.get<Todo>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }

  createTodo(request: CreateTodoRequest): Observable<Todo> {
    return this.http.post<Todo>(this.API_URL, request, { headers: this.getHeaders() });
  }

  updateTodo(id: string, request: UpdateTodoRequest): Observable<Todo> {
    return this.http.put<Todo>(`${this.API_URL}/${id}`, request, { headers: this.getHeaders() });
  }

  deleteTodo(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`, { headers: this.getHeaders() });
  }
}
