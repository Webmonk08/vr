package types

import "net/http"

type APIError struct {
	StatusCode int    `json:"statusCode"`
	Message    string `json:"message"`
	Details    string `json:"details,omitempty"`
}

func (e *APIError) Error() string {
	return e.Message
}

func NewAPIError(statusCode int, message string) *APIError {
	return &APIError{
		StatusCode: statusCode,
		Message:    message,
	}
}

func InternalServerError(message string) *APIError {
	return NewAPIError(http.StatusInternalServerError, message)
}

func BadRequest(message string) *APIError {
	return NewAPIError(http.StatusBadRequest, message)
}

func NotFound(message string) *APIError {
	return NewAPIError(http.StatusNotFound, message)
}

func Unauthorized(message string) *APIError {
	return NewAPIError(http.StatusUnauthorized, message)
}
