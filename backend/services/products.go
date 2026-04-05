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
		products = append(products, s.mapDBProductToProduct(p))
	}
	return products, nil
}

func (s *Service) GetProductByID(id int) (*types.Product, error) {
	var dbProduct types.DBProduct

	_, err := s.client.From("products").
		Select("*, product_variants(*)", "exact", false).
		Eq("id", fmt.Sprintf("%d", id)).
		Single().
		ExecuteTo(&dbProduct)

	if err != nil {
		return nil, types.InternalServerError("Failed to fetch product")
	}

	product := s.mapDBProductToProduct(dbProduct)
	return &product, nil
}

func (s *Service) mapDBProductToProduct(p types.DBProduct) types.Product {
	var variants []types.ProductVariant
	for _, v := range p.Variants {
		variants = append(variants, types.ProductVariant{
			ID:               v.ID,
			ProductID:        v.ProductID,
			Price:            v.Price,
			OriginalPrice:    v.OriginalPrice,
			Weight:           fmt.Sprintf("%g %s", v.WeightValue, v.WeightUnit),
			Stock:            v.Stock,
			ShortDescription: v.Description,
			Description:      v.LongDescription,
			Image:            v.Image,
			Isdefault:        v.Isdefault,
			Category:         v.Category,
			Features:         v.Features,
		})
	}
	return types.Product{
		ID:       p.ID,
		Name:     p.Name,
		Variants: variants,
	}
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
			"original_price":   v.OriginalPrice,
			"weight_value":     val,
			"weight_unit":      unit,
			"stock":            v.Stock,
			"description":      v.ShortDescription,
			"long_description": v.Description,
			"image":            v.Image,
			"isdefault":        v.Isdefault,
			"category":         v.Category,
			"features":         v.Features,
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
			"original_price":   v.OriginalPrice,
			"weight_value":     val,
			"weight_unit":      unit,
			"stock":            v.Stock,
			"description":      v.ShortDescription,
			"long_description": v.Description,
			"image":            v.Image,
			"isdefault":        v.Isdefault,
			"category":         v.Category,
			"features":         v.Features,
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

func (s *Service) GetRelatedProducts(variantID int) ([]types.ProductVariant, error) {
	// 1. Get the reference variant
	var allProducts []types.Product
	allProducts, err := s.GetProducts()
	if err != nil {
		return nil, err
	}

	var refVariant *types.ProductVariant
	for _, p := range allProducts {
		for _, v := range p.Variants {
			if v.ID == variantID {
				refVariant = &v
				break
			}
		}
		if refVariant != nil {
			break
		}
	}

	if refVariant == nil {
		return nil, types.BadRequest("Variant not found")
	}

	// 2. Score and filter
	type scoredVariant struct {
		variant types.ProductVariant
		score   int
	}
	var scored []scoredVariant

	for _, p := range allProducts {
		for _, v := range p.Variants {
			if v.ID == variantID {
				continue
			}

			score := 0
			// Same category
			if v.Category == refVariant.Category {
				score += 3
			}

			// Price level (+/- 20%)
			priceDiff := v.Price - refVariant.Price
			if priceDiff < 0 {
				priceDiff = -priceDiff
			}
			if priceDiff <= refVariant.Price*0.2 {
				score += 2
			}

			// Features overlap
			commonCount := 0
			refFeatures := make(map[string]bool)
			for _, f := range refVariant.Features {
				refFeatures[f] = true
			}
			for _, f := range v.Features {
				if refFeatures[f] {
					commonCount++
				}
			}
			score += commonCount

			if score > 0 {
				scored = append(scored, scoredVariant{v, score})
			}
		}
	}

	// Sort by score descending
	for i := 0; i < len(scored); i++ {
		for j := i + 1; j < len(scored); j++ {
			if scored[j].score > scored[i].score {
				scored[i], scored[j] = scored[j], scored[i]
			}
		}
	}

	var result []types.ProductVariant
	limit := 3
	if len(scored) < limit {
		limit = len(scored)
	}
	for i := 0; i < limit; i++ {
		result = append(result, scored[i].variant)
	}

	return result, nil
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
