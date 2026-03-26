package services

import (
	"fmt"
	"vr/types"
)

func (s *Service) GetCart(userID string) ([]types.CartItem, error) {
	var carts []struct {
		ID string `json:"id"`
	}
	_, err := s.client.From("carts").Select("id", "", false).Eq("user_id", userID).ExecuteTo(&carts)
	if err != nil {
		return nil, types.InternalServerError("Failed to fetch cart")
	}
	if len(carts) == 0 {
		return []types.CartItem{}, nil
	}
	cartID := carts[0].ID

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

	_, err = s.client.From("cart_items").
		Select("*, product_variants(*, products(*), inventory(*))", "exact", false).
		Eq("cart_id", cartID).
		ExecuteTo(&response)
	if err != nil {
		return nil, types.InternalServerError("Failed to fetch cart items")
	}

	var result []types.CartItem
	for _, item := range response {
		prod := &types.CartProduct{
			ID:   item.Variant.Product.ID,
			Name: item.Variant.Product.Name,
		}

		v := item.Variant.DBProductVariant
		
		var stock int
		var storageUnitID *string
		if len(v.Inventory) > 0 {
			for _, inv := range v.Inventory {
				stock += inv.Quantity
			}
			idStr := v.Inventory[0].StorageUnitID
			storageUnitID = &idStr
		}

		variant := &types.ProductVariant{
			ID:               v.ID,
			Price:            v.Price,
			Weight:           fmt.Sprintf("%g %s", v.WeightValue, v.WeightUnit),
			Stock:            stock,
			ShortDescription: v.Description,
			Description:      v.LongDescription,
			StorageUnitID:    storageUnitID,
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
	return result, nil
}

func (s *Service) AddToCart(req types.AddToCartRequest) (*types.CartItem, error) {
	var carts []struct {
		ID string `json:"id"`
	}
	_, err := s.client.From("carts").Select("id", "", false).Eq("user_id", req.UserID).ExecuteTo(&carts)
	if err != nil {
		return nil, types.InternalServerError("Failed to access cart")
	}

	var cartID string
	if len(carts) == 0 {
		var newCart []struct {
			ID string `json:"id"`
		}
		_, err := s.client.From("carts").Insert(map[string]interface{}{
			"user_id": req.UserID,
		}, false, "", "", "").ExecuteTo(&newCart)
		if err != nil {
			return nil, types.InternalServerError("Failed to create cart")
		}
		if len(newCart) > 0 {
			cartID = newCart[0].ID
		} else {
			return nil, types.InternalServerError("Failed to create cart: no ID returned")
		}
	} else {
		cartID = carts[0].ID
	}

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
		return nil, types.InternalServerError("Failed to check existing cart items")
	}

	var cartItemID int64

	if len(existingItems) > 0 {
		cartItemID = existingItems[0].ID
		finalQty := existingItems[0].Quantity + 1

		_, _, err = s.client.From("cart_items").Update(map[string]interface{}{
			"quantity": finalQty,
		}, "", "").Eq("id", fmt.Sprintf("%d", cartItemID)).Execute()
		if err != nil {
			return nil, types.InternalServerError("Failed to update cart item quantity")
		}
	} else {
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
			return nil, types.InternalServerError("Failed to add item to cart")
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
	return nil, types.InternalServerError("Item added but not found")
}

func (s *Service) UpdateCartItem(req types.UpdateCartRequest) error {
	if req.Quantity <= 0 {
		_, _, err := s.client.From("cart_items").Delete("", "").Eq("id", fmt.Sprintf("%d", req.CartID)).Execute()
		if err != nil {
			return types.InternalServerError("Failed to delete cart item")
		}
		return nil
	}

	_, _, err := s.client.From("cart_items").Update(map[string]interface{}{
		"quantity": req.Quantity,
	}, "", "").Eq("id", fmt.Sprintf("%d", req.CartID)).Execute()
	if err != nil {
		return types.InternalServerError("Failed to update cart item quantity")
	}

	return nil
}

func (s *Service) ClearCart(userID string) error {
	var carts []struct {
		ID string `json:"id"`
	}
	_, err := s.client.From("carts").Select("id", "", false).Eq("user_id", userID).ExecuteTo(&carts)
	if err != nil {
		return types.InternalServerError("Failed to access cart for clearing")
	}
	if len(carts) == 0 {
		return nil
	}
	cartID := carts[0].ID

	_, _, err = s.client.From("cart_items").Delete("", "").Eq("cart_id", cartID).Execute()
	if err != nil {
		return types.InternalServerError("Failed to clear cart items")
	}
	return nil
}
