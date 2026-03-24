package types

// CreateUserRequest is the payload for creating a new user.
type CreateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Role     string `json:"role" binding:"required"`
	PhoneNo  string `json:"phone_no" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// UpdateUserRequest is the payload for updating an existing user.
type UpdateUserRequest struct {
	Name    string `json:"name,omitempty"`
	Role    string `json:"role,omitempty"`
	PhoneNo string `json:"phone_no,omitempty"`
	Email   string `json:"email,omitempty"`
}

// UserManagementResponse is the response returned from user management endpoints.
type UserManagementResponse struct {
	ID      string `json:"id"`
	Name    string `json:"name"`
	Role    string `json:"role"`
	PhoneNo string `json:"phone_no"`
	Email   string `json:"email"`
}
