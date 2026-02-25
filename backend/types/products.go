package types

import "github.com/google/uuid"

// Database definitions (matching Supabase/Postgrest JSON response)
type DBProduct struct {
	ID       int                `json:"id"`
	Name     string             `json:"name"`
	Variants []DBProductVariant `json:"product_variants"`
}

type DBProductVariant struct {
	ID              int     `json:"id"`
	ProductID       int     `json:"product_id"`
	Price           float64 `json:"price"`
	StockQuantity   int     `json:"stock_quantity"`
	WeightValue     float64 `json:"weight_value"`
	WeightUnit      string  `json:"weight_unit"`
	SKU             string  `json:"sku"`
	Description     string  `json:"description"`
	LongDescription string  `json:"long_description"`
	Image           []string  `json:"image"`
	Isdefault       bool    `json:"isdefault"`
}

type DBCartItem struct {
	ID        int64             `json:"id"`
	CartID    uuid.UUID         `json:"cart_id"`
	Quantity  int               `json:"quantity"`
	VariantID int               `json:"variant_id"`
	Variant   *DBProductVariant `json:"product_variants"`
}

// API Response Definitions
type Product struct {
	ID       int              `json:"id"`
	Name     string           `json:"name"`
	Variants []ProductVariant `json:"variants"`
}

type ProductVariant struct {
	ID               int     `json:"id"`
	Price            float64 `json:"price"`
	Weight           string  `json:"weight"`
	Stock            int     `json:"stock"`
	ShortDescription string  `json:"shortDescription"`
	Description      string  `json:"description"`
	SKU              string  `json:"sku"`
	Image            []string  `json:"image"`
	Isdefault        bool    `json:"isdefault"`
}
type CartProduct struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}
type CartItem struct {
	UserID   string          `json:"user_id"`
	ID       int64           `json:"id"`
	Product  *CartProduct    `json:"product"`
	Variant  *ProductVariant `json:"variant"`
	Quantity int             `json:"quantity"`
}

// Request Types
type AddToCartRequest struct {
	ProductID int    `json:"product_id"`
	VariantID int    `json:"variant_id"`
	UserID    string `json:"user_id"`
}

type UpdateCartRequest struct {
	CartID int64 `json:"cart_id"` // Note: The TS said cart_id is number, but usually cart ID is UUID in schema.
	// Wait, cart_items.id is int64. carts.id is UUID.
	// The TS said "cart_id: number" in body. Maybe they meant cart_item_id?
	// "Update item quantity | { cart_id: number, product_variant_id: number, quantity: number, user_id: string }"
	// If cart_id is number, it might be the cart_item id?
	// Or maybe the user schema description is slightly off vs the TS.
	// The table `carts` has UUID id. `cart_items` has int ID.
	// I will assume `cart_id` in the request might refer to `cart_items.id` or I have to clarify.
	// Given the endpoints list, let's assume `cart_id` in the input body for Update actually refers to `cart_items` ID or `carts` ID.
	// If it's `carts` ID, it should be string/UUID.
	// If it's `cart_items` ID, it is a number.
	// Let's assume for now it corresponds to `cart_items.id` based on "number" type, or maybe the TS definition is loose.
	// Actually, looking at `POST /api/cart/add` response `CartItem`, `id` is number.
	// So `update` taking `cart_id: number` probably means `cart_item_id`.
	// But the field name is `cart_id`. This is confusing.
	// However, to update an item, we need to identify the item.
	// `product_variant_id` + `user_id` could identify it if we look up the user's cart.
	// Let's stick to the names provided but try to infer logic.
	ProductVariantID int    `json:"product_variant_id"`
	Quantity         int    `json:"quantity"`
	UserID           string `json:"user_id"`
}

type ClearCartRequest struct {
	UserID string `json:"user_id"`
}

type ProfileRequest struct {
	UserID string `json:"userId"`
}

type UpdateProfileRequest struct {
	UserID  string `json:"userId"` // Needed to identify user if not in context
	Name    string `json:"name,omitempty"`
	Address string `json:"address,omitempty"`
	Phone   string `json:"phone,omitempty"`
}

type User struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Address  string `json:"address"`
	Phone_no string `json:"phone_no"`
}
