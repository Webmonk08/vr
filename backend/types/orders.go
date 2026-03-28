package types

type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "PENDING"
	OrderStatusShipped   OrderStatus = "SHIPPED"
	OrderStatusDelivered OrderStatus = "DELIVERED"
)

// --- Database types (matching Supabase/PostgREST JSON) ---

type DBOrder struct {
	ID              string        `json:"id"`
	UserID          string        `json:"user_id"`
	Status          OrderStatus   `json:"status"`
	TotalAmount     float64       `json:"total_amount"`
	CreatedAt       string        `json:"created_at"`
	ShippingAddress string        `json:"shipping_address"`
	PhoneNo         string        `json:"phone_no"`
	Items           []DBOrderItem `json:"order_items"`
	Profile         *DBUser       `json:"users,omitempty"`
}

type DBUser struct {
	ID    string `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
}

type DBOrderItem struct {
	ID              int     `json:"id"`
	OrderID         string  `json:"order_id"`
	ProductID       int     `json:"product_id"`
	VariantID       int     `json:"variant_id"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
	// Joined relations
	Variant *DBProductVariant `json:"product_variants,omitempty"`
	Product *struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"products,omitempty"`
}

// --- API Response types ---

type Order struct {
	ID              string      `json:"id"`
	UserID          string      `json:"user_id"`
	Status          OrderStatus `json:"status"`
	TotalAmount     float64     `json:"total_amount"`
	CreatedAt       string      `json:"created_at"`
	ShippingAddress string      `json:"shipping_address"`
	PhoneNo         string      `json:"phone_no"`
	Items           []OrderItem `json:"items"`
	CustomerName    string      `json:"customer_name,omitempty"`
	CustomerEmail   string      `json:"customer_email,omitempty"`
	StorageName     string      `json:"storage_name,omitempty"`
}

type OrderItem struct {
	ID              int      `json:"id"`
	ProductID       int      `json:"product_id"`
	ProductName     string   `json:"product_name"`
	VariantID       int      `json:"variant_id"`
	Quantity        int      `json:"quantity"`
	PriceAtPurchase float64  `json:"price_at_purchase"`
	Weight          string   `json:"weight,omitempty"`
	Image           []string `json:"image,omitempty"`
}

// --- Request types ---

type CreateOrderRequest struct {
	UserID          string                 `json:"user_id" binding:"required"`
	ShippingAddress string                 `json:"shipping_address" binding:"required"`
	PhoneNo         string                 `json:"phone_no" binding:"required"`
	Items           []CreateOrderItemInput `json:"items" binding:"required"`
}

type CreateOrderItemInput struct {
	ProductID       int     `json:"product_id"`
	VariantID       int     `json:"variant_id"`
	Quantity        int     `json:"quantity"`
	PriceAtPurchase float64 `json:"price_at_purchase"`
}

type UpdateOrderStatusRequest struct {
	Status OrderStatus `json:"status" binding:"required"`
}
