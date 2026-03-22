package services

import (
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
				Stock:            v.StockQuantity,
				ShortDescription: v.Description,
				Description:      v.LongDescription,
				SKU:              v.SKU,
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
	return products, nil
}

func (s *Service) CreateProduct(product types.Product) (*types.Product, error) {
	var newProduct []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}
	_, err := s.client.From("products").Insert(map[string]interface{}{
		"name": product.Name,
	}, false, "", "", "").ExecuteTo(&newProduct)
	if err != nil {
		return nil, types.InternalServerError("Failed to insert product")
	}
	if len(newProduct) == 0 {
		return nil, types.InternalServerError("No product returned after insert")
	}

	createdProductID := newProduct[0].ID
	var createdVariants []types.ProductVariant

	for _, v := range product.Variants {
		var val float64
		var unit string
		fmt.Sscanf(v.Weight, "%f %s", &val, &unit)
		if unit == "" {
			unit = "kg"
		}

		var newVariant []types.DBProductVariant
		_, err := s.client.From("product_variants").Insert(map[string]interface{}{
			"product_id":       createdProductID,
			"price":            v.Price,
			"weight_value":     val,
			"weight_unit":      unit,
			"stock_quantity":   v.Stock,
			"sku":              v.SKU,
			"description":      v.ShortDescription,
			"long_description": v.Description,
			"image":            v.Image,
			"isdefault":        v.Isdefault,
		}, false, "", "", "").ExecuteTo(&newVariant)
		if err != nil {
			return nil, types.InternalServerError("Failed to insert variant")
		}
		if len(newVariant) > 0 {
			dbV := newVariant[0]
			createdVariants = append(createdVariants, types.ProductVariant{
				ID:               dbV.ID,
				Price:            dbV.Price,
				Weight:           fmt.Sprintf("%g %s", dbV.WeightValue, dbV.WeightUnit),
				Stock:            dbV.StockQuantity,
				ShortDescription: dbV.Description,
				Description:      dbV.LongDescription,
				SKU:              dbV.SKU,
				Image:            dbV.Image,
				Isdefault:        dbV.Isdefault,
			})
		}
	}

	return &types.Product{
		ID:       createdProductID,
		Name:     newProduct[0].Name,
		Variants: createdVariants,
	}, nil
}

func (s *Service) UpdateProduct(id int, data types.Product) (*types.Product, error) {
	_, _, err := s.client.From("products").Update(map[string]interface{}{
		"name": data.Name,
	}, "", "").Eq("id", fmt.Sprintf("%d", id)).Execute()
	if err != nil {
		return nil, types.InternalServerError("Failed to update product name")
	}

	for _, v := range data.Variants {
		var val float64
		var unit string
		fmt.Sscanf(v.Weight, "%f %s", &val, &unit)
		if unit == "" {
			unit = "kg"
		}

		updates := map[string]interface{}{
			"price":            v.Price,
			"weight_value":     val,
			"weight_unit":      unit,
			"stock_quantity":   v.Stock,
			"sku":              v.SKU,
			"description":      v.ShortDescription,
			"long_description": v.Description,
			"image":            v.Image,
			"isdefault":        v.Isdefault,
		}

		if v.ID != 0 {
			_, _, err := s.client.From("product_variants").Update(updates, "", "").Eq("id", fmt.Sprintf("%d", v.ID)).Execute()
			if err != nil {
				return nil, types.InternalServerError("Failed to update product variant")
			}
		} else {
			updates["product_id"] = id
			_, _, err := s.client.From("product_variants").Insert(updates, false, "", "", "").Execute()
			if err != nil {
				return nil, types.InternalServerError("Failed to insert new product variant")
			}
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

