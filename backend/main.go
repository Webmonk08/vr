package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

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

var supabaseClient *supabase.Client

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	API_URL := os.Getenv("SUPABASE_API_URL")
	API_KEY := os.Getenv("SUPABASE_ANON_KEY")

	var initErr error
	supabaseClient, initErr = supabase.NewClient(API_URL, API_KEY, &supabase.ClientOptions{})

	if initErr != nil {
		log.Fatal("Failed to initialize the client: ", initErr)
	}

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/api/products/getAll", func(c *gin.Context) {
		println("Products")
		products, err := getProducts()
		println(err)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, products)
	})

	r.Run(":8080")
}

func getProducts() ([]Product, error) {
	var products []Product

	_, err := supabaseClient.From("products").
		Select("*, product_variants(*)", "exact", false).
		ExecuteTo(&products)
	println(err)
	if err != nil {
		return nil, err
	}
	println(products)
	return products, nil
}
