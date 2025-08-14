export interface Todo {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface CreateTodoRequest {
  title: string;
  description: string;
  isCompleted: boolean;
}

export interface UpdateTodoRequest {
  title: string;
  description: string;
  isCompleted: boolean;
}
