package services

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"os"
	"vr/types"
)

// Helper for making Supabase Auth API calls
func doAuthRequest(method, endpoint string, body interface{}, authHeader string) ([]byte, error) {
	apiURL := os.Getenv("SUPABASE_API_URL")
	apiKey := os.Getenv("SUPABASE_ANON_KEY")

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, types.InternalServerError("Failed to marshal request body")
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, apiURL+endpoint, reqBody)
	if err != nil {
		return nil, types.InternalServerError("Failed to create request")
	}

	req.Header.Set("apikey", apiKey)
	req.Header.Set("Content-Type", "application/json")
	if authHeader != "" {
		req.Header.Set("Authorization", authHeader)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, types.InternalServerError("Failed to execute request")
	}
	defer resp.Body.Close()

	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, types.InternalServerError("Failed to read response body")
	}

	if resp.StatusCode >= 400 {
		var errRes map[string]interface{}
		json.Unmarshal(respData, &errRes)
		msg := "Authentication failed"
		if m, ok := errRes["msg"].(string); ok {
			msg = m
		} else if m, ok := errRes["error_description"].(string); ok {
			msg = m
		} else if m, ok := errRes["message"].(string); ok {
			msg = m
		}

		code := types.ErrCodeUnauthorized
		if resp.StatusCode == 400 {
			code = types.ErrCodeBadRequest
		} else if resp.StatusCode == 422 {
			code = types.ErrCodeValidation
		} else if resp.StatusCode == 429 {
			code = types.ErrCodeServiceUnavailable
		}

		return nil, &types.APIError{
			StatusCode: resp.StatusCode,
			Code:       code,
			Message:    msg,
			Details:    string(respData),
		}
	}

	return respData, nil
}

func doAuthAdminRequest(method, endpoint string, body interface{}) ([]byte, error) {
	apiURL := os.Getenv("SUPABASE_API_URL")
	apiKey := os.Getenv("SUPABASE_SERVICE_ROLE_KEY")

	var reqBody io.Reader
	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, types.InternalServerError("Failed to marshal request body")
		}
		reqBody = bytes.NewBuffer(jsonBody)
	}

	req, err := http.NewRequest(method, apiURL+endpoint, reqBody)
	if err != nil {
		return nil, types.InternalServerError("Failed to create request")
	}

	req.Header.Set("apikey", apiKey)
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, types.InternalServerError("Failed to execute request")
	}
	defer resp.Body.Close()

	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, types.InternalServerError("Failed to read response body")
	}

	if resp.StatusCode >= 400 {
		var errRes map[string]interface{}
		json.Unmarshal(respData, &errRes)
		msg := "Admin operation failed"
		if m, ok := errRes["msg"].(string); ok {
			msg = m
		} else if m, ok := errRes["message"].(string); ok {
			msg = m
		}

		code := types.ErrCodeInternal
		if resp.StatusCode == 400 {
			code = types.ErrCodeBadRequest
		} else if resp.StatusCode == 403 {
			code = types.ErrCodeForbidden
		}

		return nil, &types.APIError{
			StatusCode: resp.StatusCode,
			Code:       code,
			Message:    msg,
			Details:    string(respData),
		}
	}

	return respData, nil
}

func (s *Service) SignUp(req types.AuthRequest) (map[string]interface{}, error) {
	data, err := doAuthRequest("POST", "/auth/v1/signup", req, "")
	if err != nil {
		return nil, err
	}
	var res map[string]interface{}
	json.Unmarshal(data, &res)
	return res, nil
}

func (s *Service) SignIn(req types.AuthRequest) (map[string]interface{}, error) {
	data, err := doAuthRequest("POST", "/auth/v1/token?grant_type=password", req, "")
	if err != nil {
		return nil, err
	}
	var res map[string]interface{}
	json.Unmarshal(data, &res)
	return res, nil
}

func (s *Service) SignOut(token string) error {
	_, err := doAuthRequest("POST", "/auth/v1/logout", nil, "Bearer "+token)
	return err
}

func (s *Service) ChangePassword(token string, newPassword string) (map[string]interface{}, error) {
	reqBody := map[string]string{"password": newPassword}
	data, err := doAuthRequest("PUT", "/auth/v1/user", reqBody, "Bearer "+token)
	if err != nil {
		return nil, err
	}
	var res map[string]interface{}
	json.Unmarshal(data, &res)
	return res, nil
}

func (s *Service) GetUserRole(userID string) (string, error) {
	var users []struct {
		Role string `json:"role"`
	}
	_, err := s.client.From("users").Select("role", "", false).Eq("id", userID).ExecuteTo(&users)
	if err != nil {
		return "", types.InternalServerError("Failed to fetch user role")
	}
	if len(users) == 0 {
		return "", types.NotFound("User not found")
	}
	return users[0].Role, nil
}
