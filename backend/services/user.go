package services

import (
	"encoding/json"
	"vr/types"
)

func (s *Service) GetProfile(userID string) (*types.User, error) {
	var users []types.User
	_, err := s.client.From("users").Select("*", "exact", false).Eq("id", userID).ExecuteTo(&users)
	if err != nil {
		return nil, types.InternalServerError("Failed to fetch user profile")
	}
	if len(users) == 0 {
		return nil, types.NotFound("User profile not found")
	}
	return &users[0], nil
}

func (s *Service) UpdateProfile(req types.UpdateProfileRequest) (*types.User, error) {
	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.Phone != "" {
		updates["phone_no"] = req.Phone
	}

	if len(updates) == 0 {
		return s.GetProfile(req.UserID)
	}

	var users []types.User
	_, err := s.client.From("users").Update(updates, "", "").Eq("id", req.UserID).ExecuteTo(&users)
	if err != nil {
		return nil, types.InternalServerError("Failed to update user profile")
	}
	if len(users) == 0 {
		return nil, types.NotFound("User profile not found for update")
	}
	return &users[0], nil
}

// --- User Management (Admin) ---

func isValidRole(role string) bool {
	return role == "admin" || role == "manager"
}

func (s *Service) CreateUser(req types.CreateUserRequest) (*types.UserManagementResponse, error) {
	// Validate role
	if !isValidRole(req.Role) {
		return nil, types.BadRequest("Invalid role: must be 'admin' or 'manager'")
	}

	// 1. Create the auth user via Supabase Auth signup
	authReq := types.AuthRequest{
		Email:    req.Email,
		Password: req.Password,
	}
	data, err := doAuthRequest("POST", "/auth/v1/signup", authReq, "")
	if err != nil {
		return nil, err
	}

	var authRes map[string]interface{}
	if err := json.Unmarshal(data, &authRes); err != nil {
		return nil, types.InternalServerError("Failed to parse auth response")
	}

	// Extract the user ID from the auth response
	userObj, ok := authRes["user"].(map[string]interface{})
	if !ok {
		return nil, types.InternalServerError("Failed to extract user from auth response")
	}
	userID, ok := userObj["id"].(string)
	if !ok || userID == "" {
		return nil, types.InternalServerError("Failed to extract user ID from auth response")
	}

	// 2. Insert into the users table with role and other details
	insertData := map[string]interface{}{
		"id":       userID,
		"name":     req.Name,
		"role":     req.Role,
		"phone_no": req.PhoneNo,
		"email":    req.Email,
	}

	var users []types.UserManagementResponse
	_, err = s.client.From("users").Insert(insertData, false, "", "", "").ExecuteTo(&users)
	if err != nil {
		return nil, types.InternalServerError("Failed to insert user into database")
	}
	if len(users) == 0 {
		return nil, types.InternalServerError("No user returned after insert")
	}

	return &users[0], nil
}

func (s *Service) UpdateUser(userID string, req types.UpdateUserRequest) (*types.UserManagementResponse, error) {
	// Validate role if provided
	if req.Role != "" && !isValidRole(req.Role) {
		return nil, types.BadRequest("Invalid role: must be 'admin' or 'manager'")
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Role != "" {
		updates["role"] = req.Role
	}
	if req.PhoneNo != "" {
		updates["phone_no"] = req.PhoneNo
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}

	if len(updates) == 0 {
		return nil, types.BadRequest("No fields to update")
	}

	var users []types.UserManagementResponse
	_, err := s.client.From("users").Update(updates, "", "").Eq("id", userID).ExecuteTo(&users)
	if err != nil {
		return nil, types.InternalServerError("Failed to update user")
	}
	if len(users) == 0 {
		return nil, types.NotFound("User not found")
	}
	return &users[0], nil
}

func (s *Service) DeleteUser(userID string) error {
	_, _, err := s.client.From("users").Delete("", "").Eq("id", userID).Execute()
	if err != nil {
		return types.InternalServerError("Failed to delete user")
	}
	return nil
}

func (s *Service) GetAllUsers() ([]types.UserManagementResponse, error) {
	var users []types.UserManagementResponse
	_, err := s.client.From("users").Select("id, name, role, phone_no, email", "", false).ExecuteTo(&users)
	if err != nil {
		return nil, types.InternalServerError("Failed to fetch users")
	}
	return users, nil
}
