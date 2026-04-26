package utils

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

type TodoStatus string

const (
	StatusActive TodoStatus = "active"
	StatusDone   TodoStatus = "done"
)

type Todo struct {
	ID        string     `json:"id"`
	Title     string     `json:"title"`
	Status    TodoStatus `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
}

type TodoService struct {
	filePath string
}

func NewTodoService() *TodoService {
	configDir, _ := os.UserConfigDir()
	dir := filepath.Join(configDir, "Komodoro", "todos")
	return &TodoService{
		filePath: filepath.Join(dir, "todos.json"),
	}
}

func (s *TodoService) loadTodos() ([]Todo, error) {
	data, err := os.ReadFile(s.filePath)
	if errors.Is(err, os.ErrNotExist) {
		return []Todo{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("could not read todos file: %w", err)
	}
	var todos []Todo
	if err := json.Unmarshal(data, &todos); err != nil {
		return nil, fmt.Errorf("could not parse todos: %w", err)
	}
	return todos, nil
}

func (s *TodoService) saveTodos(todos []Todo) error {
	if err := os.MkdirAll(filepath.Dir(s.filePath), 0755); err != nil {
		return fmt.Errorf("could not create todos directory: %w", err)
	}
	data, err := json.MarshalIndent(todos, "", "  ")
	if err != nil {
		return fmt.Errorf("could not serialize todos: %w", err)
	}
	return os.WriteFile(s.filePath, data, 0644)
}

// AddTodo creates a new active todo with an auto-generated ID and appends it to todos.json.
func (s *TodoService) AddTodo(title string) (Todo, error) {
	todos, err := s.loadTodos()
	if err != nil {
		return Todo{}, err
	}
	todo := Todo{
		ID:        uuid.New().String(),
		Title:     title,
		Status:    StatusActive,
		CreatedAt: time.Now(),
	}
	todos = append(todos, todo)
	return todo, s.saveTodos(todos)
}

// DeleteAllTasks removes every task from todos.json.
func (s *TodoService) DeleteAllTasks() error {
	return s.saveTodos([]Todo{})
}

// DeleteTaskByID removes the task with the given ID from todos.json.
func (s *TodoService) DeleteTaskByID(id string) error {
	todos, err := s.loadTodos()
	if err != nil {
		return err
	}
	filtered := make([]Todo, 0, len(todos))
	for _, t := range todos {
		if t.ID != id {
			filtered = append(filtered, t)
		}
	}
	return s.saveTodos(filtered)
}

// GetTodos returns all todos from todos.json.
func (s *TodoService) GetTodos() ([]Todo, error) {
	return s.loadTodos()
}

// SetTaskStatus sets the status of a task to either "active" or "done".
func (s *TodoService) SetTaskStatus(id string, status TodoStatus) error {
	todos, err := s.loadTodos()
	if err != nil {
		return err
	}
	for i, t := range todos {
		if t.ID == id {
			todos[i].Status = status
			return s.saveTodos(todos)
		}
	}
	return fmt.Errorf("task with id %q not found", id)
}

// ClearFinishedTasks removes all tasks whose status is "done".
func (s *TodoService) ClearFinishedTasks() error {
	todos, err := s.loadTodos()
	if err != nil {
		return err
	}
	active := make([]Todo, 0, len(todos))
	for _, t := range todos {
		if t.Status != StatusDone {
			active = append(active, t)
		}
	}
	return s.saveTodos(active)
}
