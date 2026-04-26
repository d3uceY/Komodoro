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

type TaskStatus string

const (
	StatusActive TaskStatus = "active"
	StatusDone   TaskStatus = "done"
)

type Task struct {
	ID        string     `json:"id"`
	Title     string     `json:"title"`
	Status    TaskStatus `json:"status"`
	CreatedAt time.Time  `json:"createdAt"`
}

type TaskService struct {
	filePath string
}

// NewTaskService creates a new TaskService with the file path set to the user's config directory.
func NewTaskService() *TaskService {
	configDir, _ := os.UserConfigDir()
	dir := filepath.Join(configDir, "Komodoro", "tasks")
	return &TaskService{
		filePath: filepath.Join(dir, "tasks.json"),
	}
}

// loadTasks reads the tasks from the JSON file and returns them as a slice of Task structs.
func (s *TaskService) loadTasks() ([]Task, error) {
	data, err := os.ReadFile(s.filePath)
	if errors.Is(err, os.ErrNotExist) {
		return []Task{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("could not read tasks file: %w", err)
	}
	var tasks []Task
	if err := json.Unmarshal(data, &tasks); err != nil {
		return nil, fmt.Errorf("could not parse tasks: %w", err)
	}
	return tasks, nil
}

// saveTasks writes the given slice of Task structs to the JSON file.
func (s *TaskService) saveTasks(tasks []Task) error {
	if err := os.MkdirAll(filepath.Dir(s.filePath), 0755); err != nil {
		return fmt.Errorf("could not create tasks directory: %w", err)
	}
	data, err := json.MarshalIndent(tasks, "", "  ")
	if err != nil {
		return fmt.Errorf("could not serialize tasks: %w", err)
	}
	return os.WriteFile(s.filePath, data, 0644)
}

// AddTask creates a new active task with an auto-generated ID and appends it to tasks.json.
func (s *TaskService) AddTask(title string) (Task, error) {
	tasks, err := s.loadTasks()
	if err != nil {
		return Task{}, err
	}
	task := Task{
		ID:        uuid.New().String(),
		Title:     title,
		Status:    StatusActive,
		CreatedAt: time.Now(),
	}
	tasks = append(tasks, task)
	return task, s.saveTasks(tasks)
}

// DeleteAllTasks removes every task from tasks.json.
func (s *TaskService) DeleteAllTasks() error {
	return s.saveTasks([]Task{})
}

// DeleteTaskByID removes the task with the given ID from tasks.json.
func (s *TaskService) DeleteTaskByID(id string) error {
	tasks, err := s.loadTasks()
	if err != nil {
		return err
	}
	filtered := make([]Task, 0, len(tasks))
	for _, t := range tasks {
		if t.ID != id {
			filtered = append(filtered, t)
		}
	}
	return s.saveTasks(filtered)
}

// GetTasks returns all tasks from tasks.json.
func (s *TaskService) GetTasks() ([]Task, error) {
	return s.loadTasks()
}

// SetTaskStatus sets the status of a task to either "active" or "done".
func (s *TaskService) SetTaskStatus(id string, status TaskStatus) error {
	tasks, err := s.loadTasks()
	if err != nil {
		return err
	}
	for i, t := range tasks {
		if t.ID == id {
			tasks[i].Status = status
			return s.saveTasks(tasks)
		}
	}
	return fmt.Errorf("task with id %q not found", id)
}

// ClearFinishedTasks removes all tasks whose status is "done".
func (s *TaskService) ClearFinishedTasks() error {
	tasks, err := s.loadTasks()
	if err != nil {
		return err
	}
	active := make([]Task, 0, len(tasks))
	for _, t := range tasks {
		if t.Status != StatusDone {
			active = append(active, t)
		}
	}
	return s.saveTasks(active)
}
