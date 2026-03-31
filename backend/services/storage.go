package services

import (
	"fmt"
	"io"
	"time"
	"vr/types"

	storage_go "github.com/supabase-community/storage-go"
	"github.com/supabase-community/supabase-go"
)

type StorageService struct {
	client *supabase.Client
}

func NewStorageService(sbClient *supabase.Client) *StorageService {
	return &StorageService{
		client: sbClient,
	}
}

type FileInfo struct {
	FileName    string
	Content     io.Reader
	ContentType string
}

func (s *StorageService) UploadImages(bucketName string, files []*FileInfo) ([]string, error) {
	var urls []string

	for _, file := range files {
		contentType := file.ContentType
		result, err := s.client.Storage.UploadFile(
			bucketName,
			file.FileName,
			file.Content,
			storage_go.FileOptions{
				ContentType: &contentType,
			},
		)
		if err != nil {
			fmt.Println(err)
			return nil, types.InternalServerError(fmt.Sprintf("Failed to upload image: %v", err))
		}
		if result.Error != "" {
			fmt.Println(result.Error)
			return nil, types.InternalServerError(fmt.Sprintf("Failed to upload image: %v", result.Error))
		}

		publicURL := s.client.Storage.GetPublicUrl(bucketName, file.FileName)
		urls = append(urls, publicURL.SignedURL)
	}

	return urls, nil
}

func (s *StorageService) UploadImage(bucketName string, file *FileInfo) (string, error) {
	urls, err := s.UploadImages(bucketName, []*FileInfo{file})
	if err != nil {
		return "", err
	}
	if len(urls) == 0 {
		return "", types.InternalServerError("Failed to get uploaded image URL")
	}
	return urls[0], nil
}

func (s *StorageService) DeleteImages(bucketName string, imageURLs []string) error {
	var paths []string
	for _, url := range imageURLs {
		objectName := ExtractObjectName(url)
		if objectName != "" {
			paths = append(paths, objectName)
		}
	}

	if len(paths) == 0 {
		return nil
	}

	result, err := s.client.Storage.RemoveFile(bucketName, paths)
	if err != nil {
		return types.InternalServerError(fmt.Sprintf("Failed to delete images: %v", err))
	}
	if result != nil && len(result) > 0 && result[0].Error != "" {
		return types.InternalServerError(fmt.Sprintf("Failed to delete images: %v", result[0].Error))
	}
	return nil
}

func ExtractObjectName(url string) string {
	if url == "" {
		return ""
	}
	for i := len(url) - 1; i >= 0; i-- {
		if url[i] == '/' {
			return url[i+1:]
		}
	}
	return url
}

func GenerateUniqueFileName(originalFilename string) string {
	timestamp := time.Now().UnixNano() / int64(time.Millisecond)
	return fmt.Sprintf("%d_%s", timestamp, originalFilename)
}
