package types

import "net/http"

type ErrorCode string

const (
	ErrCodeValidation         ErrorCode = "VALIDATION_ERROR"
	ErrCodeUnauthorized       ErrorCode = "UNAUTHORIZED"
	ErrCodeForbidden          ErrorCode = "FORBIDDEN"
	ErrCodeNotFound           ErrorCode = "NOT_FOUND"
	ErrCodeInternal           ErrorCode = "INTERNAL_ERROR"
	ErrCodeConflict           ErrorCode = "CONFLICT"
	ErrCodeBadRequest         ErrorCode = "BAD_REQUEST"
	ErrCodeServiceUnavailable ErrorCode = "SERVICE_UNAVAILABLE"
)

type APIError struct {
	StatusCode int       `json:"statusCode"`
	Code       ErrorCode `json:"code"`
	Message    string    `json:"message"`
	Details    string    `json:"details,omitempty"`
}

func (e *APIError) Error() string {
	return e.Message
}

func NewAPIError(statusCode int, code ErrorCode, message string) *APIError {
	return &APIError{
		StatusCode: statusCode,
		Code:       code,
		Message:    message,
	}
}

func InternalServerError(message string) *APIError {
	return NewAPIError(http.StatusInternalServerError, ErrCodeInternal, message)
}

func BadRequest(message string) *APIError {
	return NewAPIError(http.StatusBadRequest, ErrCodeBadRequest, message)
}

func ValidationError(message string) *APIError {
	return NewAPIError(http.StatusBadRequest, ErrCodeValidation, message)
}

func NotFound(message string) *APIError {
	return NewAPIError(http.StatusNotFound, ErrCodeNotFound, message)
}

func Unauthorized(message string) *APIError {
	return NewAPIError(http.StatusUnauthorized, ErrCodeUnauthorized, message)
}

func Forbidden(message string) *APIError {
	return NewAPIError(http.StatusForbidden, ErrCodeForbidden, message)
}

func Conflict(message string) *APIError {
	return NewAPIError(http.StatusConflict, ErrCodeConflict, message)
}

func ServiceUnavailable(message string) *APIError {
	return NewAPIError(http.StatusServiceUnavailable, ErrCodeServiceUnavailable, message)
}
