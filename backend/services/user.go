package services

import (
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
