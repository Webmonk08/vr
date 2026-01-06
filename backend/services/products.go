package services

import (
	"vr/types"

	"github.com/supabase-community/supabase-go"
)

type Service struct {
	client *supabase.Client
}

// NewService is a constructor that "injects" the client
func NewService(sbClient *supabase.Client) *Service {
	return &Service{
		client: sbClient,
	}
}

func (s *Service) GetProducts() ([]types.Product, error) {
	var products []types.Product

	_, err := s.client.From("products").
		Select("*, product_variants(*)", "exact", false).
		ExecuteTo(&products)
	println(err)
	if err != nil {
		return nil, err
	}
	println(products)
	return products, nil
}

func (s *Service) UpdateProducts(id int, data types.Product) error {
	return nil
}
