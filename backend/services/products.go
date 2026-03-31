package services

import (
	"encoding/json"
	"fmt"
	"vr/types"

	"github.com/supabase-community/supabase-go"
)

type Service struct {
	client *supabase.Client
}

func NewService(sbClient *supabase.Client) *Service {
	return &Service{
		client: sbClient,
	}
}

func (s *Service) GetProducts() ([]types.Product, error) {
	var dbProducts []types.DBProduct

	_, err := s.client.From("products").
		Select("*, product_variants(*)", "exact", false).
		ExecuteTo(&dbProducts)
	if err != nil {
		return nil, types.InternalServerError("Failed to fetch products")
	}

	var products []types.Product
	for _, p := range dbProducts {
		var variants []types.ProductVariant
		for _, v := range p.Variants {
			variants = append(variants, types.ProductVariant{
				ID:               v.ID,
				Price:            v.Price,
				Weight:           fmt.Sprintf("%g %s", v.WeightValue, v.WeightUnit),
				Stock:            v.Stock,
				ShortDescription: v.Description,
				Description:      v.LongDescription,
				Image:            v.Image,
				Isdefault:        v.Isdefault,
			})
		}
		products = append(products, types.Product{
			ID:       p.ID,
			Name:     p.Name,
			Variants: variants,
		})
	}
	fmt.Println("products", products)
	return products, nil
}

func (s *Service) CreateProduct(product types.Product) (*types.Product, error) {
	var variantsPayload []map[string]interface{}

	for _, v := range product.Variants {
		var val float64
		var unit string
		fmt.Sscanf(v.Weight, "%f %s", &val, &unit)
		if unit == "" {
			unit = "kg"
		}

		variantsPayload = append(variantsPayload, map[string]interface{}{
			"price":            v.Price,
			"weight_value":     val,
			"weight_unit":      unit,
			"stock":            v.Stock,
			"description":      v.ShortDescription,
			"long_description": v.Description,
			"image":            v.Image,
			"isdefault":        v.Isdefault,
		})
	}

	result := s.client.Rpc("create_product_with_variants", "", map[string]interface{}{
		"p_name":     product.Name,
		"p_variants": variantsPayload,
	})

	var createdID int
	if err := json.Unmarshal([]byte(result), &createdID); err != nil {
		fmt.Println("Error RPC create_product_with_variants:", result)
		return nil, types.InternalServerError("Failed to create product via RPC")
	}

	products, err := s.GetProducts()
	if err == nil {
		for _, p := range products {
			if p.ID == createdID {
				return &p, nil
			}
		}
	}
	product.ID = createdID
	return &product, nil
}

func (s *Service) UpdateProduct(id int, data types.Product) (*types.Product, error) {
	var variantsPayload []map[string]interface{}

	for _, v := range data.Variants {
		var val float64
		var unit string
		fmt.Sscanf(v.Weight, "%f %s", &val, &unit)
		if unit == "" {
			unit = "kg"
		}

		variantMap := map[string]interface{}{
			"price":            v.Price,
			"weight_value":     val,
			"weight_unit":      unit,
			"stock":            v.Stock,
			"description":      v.ShortDescription,
			"long_description": v.Description,
			"image":            v.Image,
			"isdefault":        v.Isdefault,
		}

		if v.ID != 0 {
			variantMap["id"] = v.ID
		}

		variantsPayload = append(variantsPayload, variantMap)
	}

	result := s.client.Rpc("update_product_with_variants", "", map[string]interface{}{
		"p_product_id": id,
		"p_name":       data.Name,
		"p_variants":   variantsPayload,
	})

	if result != "null" && result != "" {
		var maybeErr map[string]interface{}
		if err := json.Unmarshal([]byte(result), &maybeErr); err == nil && maybeErr["code"] != nil {
			fmt.Println("Error RPC update_product_with_variants:", result)
			return nil, types.InternalServerError("Failed to update product via RPC")
		}
	}

	products, err := s.GetProducts()
	if err == nil {
		for _, p := range products {
			if p.ID == id {
				return &p, nil
			}
		}
	}

	return &data, nil
}

func (s *Service) DeleteProduct(id int) error {
	_, _, err := s.client.From("product_variants").Delete("", "").Eq("product_id", fmt.Sprintf("%d", id)).Execute()
	if err != nil {
		return types.InternalServerError("Failed to delete product variants")
	}

	_, _, err = s.client.From("products").Delete("", "").Eq("id", fmt.Sprintf("%d", id)).Execute()
	if err != nil {
		return types.InternalServerError("Failed to delete product")
	}

	return nil
}
