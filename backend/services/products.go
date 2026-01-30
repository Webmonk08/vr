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

	// Fetch products with variants
	fmt.Println("Going for supabase")
	_, err := s.client.From("products").
		Select("*, product_variants(*)", "exact", false).
		ExecuteTo(&dbProducts)
	fmt.Println(err)
	if err != nil {
		return nil, err
	}
	fmt.Println("Fetched")
	// Map DB types to Response types
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
	// 1. Insert Product
	var newProduct []struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	}
	// ExecuteTo returns (int64, error)
	_, err := s.client.From("products").Insert(map[string]interface{}{
		"name": product.Name,
	}, false, "", "", "").ExecuteTo(&newProduct)
	if err != nil {
		return nil, fmt.Errorf("failed to insert product: %v", err)
	}
	if len(newProduct) == 0 {
		return nil, fmt.Errorf("no product returned after insert")
	}

	createdProductID := newProduct[0].ID
	var createdVariants []types.ProductVariant

	// 2. Insert Variants
	for _, v := range product.Variants {
		var val float64
		var unit string
		// Basic parsing
		fmt.Sscanf(v.Weight, "%f %s", &val, &unit)
		if unit == "" {
			unit = "kg" // default
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
			return nil, fmt.Errorf("failed to insert variant: %v", err)
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
	// Update Product Name
	// Execute returns ([]byte, int64, error)
	_, _, err := s.client.From("products").Update(map[string]interface{}{
		"name": data.Name,
	}, "", "").Eq("id", fmt.Sprintf("%d", id)).Execute()
	if err != nil {
		return nil, err
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
			// Update
			_, _, err := s.client.From("product_variants").Update(updates, "", "").Eq("id", fmt.Sprintf("%d", v.ID)).Execute()
			if err != nil {
				return nil, err
			}
		} else {
			// Insert new variant for this product
			updates["product_id"] = id
			// Insert returns (int64, error) if using ExecuteTo, or ([]byte, int64, error) if using Execute?
			// Actually Insert(...).Execute() returns ([]byte, int64, error).
			// Insert(...).ExecuteTo(...) returns (int64, error).
			// We can use Execute() if we don't need the result, but Insert defaults to returning representation usually?
			_, _, err := s.client.From("product_variants").Insert(updates, false, "", "", "").Execute()
			if err != nil {
				return nil, err
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
