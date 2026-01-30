package services

import (
	"encoding/json"
	"fmt"
	"vr/types"
)

func (s *Service) GetCart(userID string) ([]types.CartItem, error) {
	// 1. Get Cart ID for user
	var carts []struct {
		ID string `json:"id"`
	}
	_, err := s.client.From("carts").Select("id", "", false).Eq("user_id", userID).ExecuteTo(&carts)
	fmt.Println("cart items aquired", carts)
	if err != nil {
		return nil, err
	}
	if len(carts) == 0 {
		return []types.CartItem{}, nil // Empty cart
	}
	cartID := carts[0].ID

	// 2. Fetch Cart Items with related data
	type ResponseItem struct {
		ID       int64                  `json:"id"`
		Quantity int                    `json:"quantity"`
		Variant  types.DBProductVariant `json:"product_variants"`
	}

	type NestedProduct struct {
		Name string `json:"name"`
		ID   int    `json:"id"`
	}
	type NestedVariant struct {
		types.DBProductVariant
		Product NestedProduct `json:"products"`
	}
	type NestedCartItem struct {
		ID       int64         `json:"id"`
		Quantity int           `json:"quantity"`
		Variant  NestedVariant `json:"product_variants"`
	}
	var response []NestedCartItem

	fmt.Println("Gonna get the products")

	_, err = s.client.From("cart_items").
		// Fetch columns, and tell Supabase: inside product_variants, fetch the related products
		Select("*, product_variants(*, products(*))", "exact", false).
		Eq("cart_id", cartID).
		ExecuteTo(&response)
	d, _ := json.MarshalIndent(response, "", "  ")
	fmt.Println(string(d))
	fmt.Println("err", err)

	if err != nil {
		return nil, err
	}

	var result []types.CartItem
	for _, item := range response {
		// Construct Product
		fmt.Println(item)
		prod := &types.CartProduct{
			ID:   item.Variant.Product.ID,
			Name: item.Variant.Product.Name,
		}

		// Construct Variant
		v := item.Variant.DBProductVariant
		variant := &types.ProductVariant{
			ID:               v.ID,
			Price:            v.Price,
			Weight:           fmt.Sprintf("%g %s", v.WeightValue, v.WeightUnit),
			Stock:            v.StockQuantity,
			ShortDescription: v.Description,
			Description:      v.LongDescription,
			SKU:              v.SKU,
			Image:            v.Image,
			Isdefault:        v.Isdefault,
		}

		result = append(result, types.CartItem{
			UserID:   userID,
			ID:       item.ID,
			Product:  prod,
			Variant:  variant,
			Quantity: item.Quantity,
		})
	}
	fmt.Println("Gonna return carts")
	data, _ := json.MarshalIndent(result, "", "  ")
	fmt.Println(string(data))
	return result, nil
}

func (s *Service) AddToCart(req types.AddToCartRequest) (*types.CartItem, error) {
	// 1. Get or Create Cart
	var carts []struct {
		ID string `json:"id"`
	}
	_, err := s.client.From("carts").Select("id", "", false).Eq("user_id", req.UserID).ExecuteTo(&carts)
	if err != nil {
		return nil, err
	}

	var cartID string
	if len(carts) == 0 {
		// Create Cart
		var newCart []struct {
			ID string `json:"id"`
		}
		_, err := s.client.From("carts").Insert(map[string]interface{}{
			"user_id": req.UserID,
		}, false, "", "", "").ExecuteTo(&newCart)
		if err != nil {
			return nil, fmt.Errorf("failed to create cart: %v", err)
		}
		if len(newCart) > 0 {
			cartID = newCart[0].ID
		} else {
			return nil, fmt.Errorf("failed to create cart: no ID returned")
		}
	} else {
		cartID = carts[0].ID
	}

	// 2. Check if item exists in cart
	var existingItems []struct {
		ID       int64 `json:"id"`
		Quantity int   `json:"quantity"`
	}
	_, err = s.client.From("cart_items").
		Select("id, quantity", "", false).
		Eq("cart_id", cartID).
		Eq("variant_id", fmt.Sprintf("%d", req.VariantID)).
		ExecuteTo(&existingItems)
	if err != nil {
		return nil, err
	}

	var cartItemID int64

	if len(existingItems) > 0 {
		// Update Quantity
		cartItemID = existingItems[0].ID
		finalQty := existingItems[0].Quantity + 1

		_, _, err = s.client.From("cart_items").Update(map[string]interface{}{
			"quantity": finalQty,
		}, "", "").Eq("id", fmt.Sprintf("%d", cartItemID)).Execute()
		if err != nil {
			return nil, err
		}
	} else {
		// Insert
		qty := 1
		var newItems []struct {
			ID int64 `json:"id"`
		}
		_, err = s.client.From("cart_items").Insert(map[string]interface{}{
			"cart_id":    cartID,
			"product_id": req.ProductID,
			"variant_id": req.VariantID,
			"quantity":   qty,
		}, false, "", "", "").ExecuteTo(&newItems)
		if err != nil {
			return nil, err
		}
		if len(newItems) > 0 {
			cartItemID = newItems[0].ID
		}
	}

	cartItems, err := s.GetCart(req.UserID)
	if err != nil {
		return nil, err
	}
	for _, item := range cartItems {
		if item.ID == cartItemID {
			return &item, nil
		}
	}
	return nil, fmt.Errorf("item added but not found")
}

func (s *Service) UpdateCartItem(req types.UpdateCartRequest) error {
	if req.Quantity <= 0 {
		// Delete
		_, _, err := s.client.From("cart_items").Delete("", "").Eq("id", fmt.Sprintf("%d", req.CartID)).Execute()
		return err
	}

	_, _, err := s.client.From("cart_items").Update(map[string]interface{}{
		"quantity": req.Quantity,
	}, "", "").Eq("id", fmt.Sprintf("%d", req.CartID)).Execute()

	return err
}

func (s *Service) ClearCart(userID string) error {
	// Get Cart ID
	var carts []struct {
		ID string `json:"id"`
	}
	_, err := s.client.From("carts").Select("id", "", false).Eq("user_id", userID).ExecuteTo(&carts)
	if err != nil {
		return err
	}
	if len(carts) == 0 {
		return nil
	}
	cartID := carts[0].ID

	// Delete all items
	_, _, err = s.client.From("cart_items").Delete("", "").Eq("cart_id", cartID).Execute()
	return err
}
