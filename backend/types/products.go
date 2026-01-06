package types

type ProductVariant struct {
	ID          int    `json:"id"`
	Price       int    `json:"price"`
	Name        string `json:"name"`
	Stock       int    `json:"stock_quantity"`
	Description string `json:"description"`
	Image       string `json:"image"`
}

type Product struct {
	ID       int              `json:"id"`
	Name     string           `json:"name"`
	Variants []ProductVariant `json:"product_variant"`
}
