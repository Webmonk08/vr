package services

import (
	"fmt"
	"vr/types"

	"github.com/supabase-community/postgrest-go"
)

func (s *Service) GetAllOrders() ([]types.Order, error) {
	var dbOrders []types.DBOrder

	_, err := s.client.From("orders").
		Select("*, order_items(*, product_variants(*), products(id, name)), users(id, name, email)", "exact", false).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		ExecuteTo(&dbOrders)
	if err != nil {
		fmt.Println("Error fetching orders:", err)
		return nil, types.InternalServerError("Failed to fetch orders")
	}

	return s.mapOrders(dbOrders), nil
}

func (s *Service) GetOrdersByUser(userID string) ([]types.Order, error) {
	var dbOrders []types.DBOrder

	_, err := s.client.From("orders").
		Select("*, order_items(*, product_variants(*), products(id, name)), users(id, name, email)", "exact", false).
		Eq("user_id", userID).
		Order("created_at", &postgrest.OrderOpts{Ascending: false}).
		ExecuteTo(&dbOrders)
	if err != nil {
		fmt.Println("Error fetching orders for user:", err)
		return nil, types.InternalServerError("Failed to fetch orders for user")
	}

	return s.mapOrders(dbOrders), nil
}

func (s *Service) CreateOrder(req types.CreateOrderRequest) (*types.Order, error) {
	// Calculate total
	var totalAmount float64
	for _, item := range req.Items {
		totalAmount += item.PriceAtPurchase * float64(item.Quantity)
	}

	// Insert order
	var newOrders []types.DBOrder
	_, err := s.client.From("orders").Insert(map[string]interface{}{
		"user_id":          req.UserID,
		"status":           types.OrderStatusPending,
		"total_amount":     totalAmount,
		"shipping_address": req.ShippingAddress,
		"phone_no":         req.PhoneNo,
	}, false, "", "", "").ExecuteTo(&newOrders)
	if err != nil || len(newOrders) == 0 {
		fmt.Println("Error creating order:", err)
		return nil, types.InternalServerError("Failed to create order")
	}

	orderID := newOrders[0].ID

	// Insert order items
	var itemsPayload []map[string]interface{}
	for _, item := range req.Items {
		itemsPayload = append(itemsPayload, map[string]interface{}{
			"order_id":          orderID,
			"product_id":        item.ProductID,
			"variant_id":        item.VariantID,
			"quantity":          item.Quantity,
			"price_at_purchase": item.PriceAtPurchase,
		})
	}

	_, _, err = s.client.From("order_items").Insert(itemsPayload, false, "", "", "").Execute()
	if err != nil {
		fmt.Println("Error creating order items:", err)
		return nil, types.InternalServerError("Failed to create order items")
	}

	// Re-fetch the complete order with joined data
	var fetchedOrders []types.DBOrder
	_, err = s.client.From("orders").
		Select("*, order_items(*, product_variants(*), products(id, name))", "exact", false).
		Eq("id", orderID).
		ExecuteTo(&fetchedOrders)
	if err != nil || len(fetchedOrders) == 0 {
		// Return basic order even if re-fetch fails
		return &types.Order{
			ID:              orderID,
			UserID:          req.UserID,
			Status:          types.OrderStatusPending,
			TotalAmount:     totalAmount,
			ShippingAddress: req.ShippingAddress,
			PhoneNo:         req.PhoneNo,
		}, nil
	}

	orders := s.mapOrders(fetchedOrders)
	return &orders[0], nil
}

func (s *Service) UpdateOrderStatus(orderID string, status types.OrderStatus) error {
	_, _, err := s.client.From("orders").Update(map[string]interface{}{
		"status": status,
	}, "", "").Eq("id", orderID).Execute()
	if err != nil {
		fmt.Println("Error updating order status:", err)
		return types.InternalServerError("Failed to update order status")
	}
	return nil
}

func (s *Service) DeleteOrder(orderID string) error {
	// Delete order items first
	_, _, err := s.client.From("order_items").Delete("", "").Eq("order_id", orderID).Execute()
	if err != nil {
		return types.InternalServerError("Failed to delete order items")
	}

	// Delete order
	_, _, err = s.client.From("orders").Delete("", "").Eq("id", orderID).Execute()
	if err != nil {
		return types.InternalServerError("Failed to delete order")
	}

	return nil
}

// --- Helpers ---

func (s *Service) mapOrders(dbOrders []types.DBOrder) []types.Order {
	var orders []types.Order
	for _, o := range dbOrders {
		var items []types.OrderItem
		for _, item := range o.Items {
			oi := types.OrderItem{
				ID:              item.ID,
				ProductID:       item.ProductID,
				VariantID:       item.VariantID,
				Quantity:        item.Quantity,
				PriceAtPurchase: item.PriceAtPurchase,
			}

			if item.Product != nil {
				oi.ProductName = item.Product.Name
			}
			if item.Variant != nil {
				oi.Weight = fmt.Sprintf("%g %s", item.Variant.WeightValue, item.Variant.WeightUnit)
				oi.Image = item.Variant.Image
			}

			items = append(items, oi)
		}

		var customerName, customerEmail string
		if o.Profile != nil {
			customerName = o.Profile.Name
			customerEmail = o.Profile.Email
		}

		orders = append(orders, types.Order{
			ID:              o.ID,
			UserID:          o.UserID,
			Status:          o.Status,
			TotalAmount:     o.TotalAmount,
			CreatedAt:       o.CreatedAt,
			ShippingAddress: o.ShippingAddress,
			PhoneNo:         o.PhoneNo,
			Items:           items,
			CustomerName:    customerName,
			CustomerEmail:   customerEmail,
			StorageName:     "ABC",
		})
	}
	return orders
}


