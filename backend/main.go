package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"vr/services"
	"vr/types"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Error loading .env file")
	}

	API_URL := os.Getenv("SUPABASE_API_URL")
	API_KEY := os.Getenv("SUPABASE_ANON_KEY")

	if API_URL == "" || API_KEY == "" {
		log.Fatal("SUPABASE_API_URL and SUPABASE_ANON_KEY must be set")
	}

	supabaseClient, initErr := supabase.NewClient(API_URL, API_KEY, &supabase.ClientOptions{})
	fmt.Println("supabaseClient created")
	if initErr != nil {
		log.Fatal("Failed to initialize the client: ", initErr)
	}

	service := services.NewService(supabaseClient)

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// --- Products Endpoints ---

	r.GET("/api/products/getAll", func(c *gin.Context) {
		fmt.Println("Gonna fetch")
		products, err := service.GetProducts()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, products)
	})

	r.POST("/api/products/create", func(c *gin.Context) {
		var product types.Product
		fmt.Println("bind")
		if err := c.ShouldBindJSON(&product); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fmt.Println("gonna create the profucts")
		created, err := service.CreateProduct(product)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, created)
	})

	r.POST("/api/products/update/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
			return
		}

		// The prompt specified request body: { id: number, data: Product }
		// But usually PUT /:id uses the ID from URL or Body.
		// We'll bind the body to check for 'data'.
		type UpdateReq struct {
			ID   int           `json:"id"`
			Data types.Product `json:"data"`
		}
		var req UpdateReq
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		updated, err := service.UpdateProduct(id, req.Data)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, updated)
	})

	// --- Cart Endpoints ---

	r.GET("/api/cart/get", func(c *gin.Context) {
		userID := c.Query("user_id")
		if userID == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "user_id is required"})
			return
		}
		fmt.Println("Cart request")
		cart, err := service.GetCart(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		data, _ := json.MarshalIndent(cart, "", "  ")
		fmt.Println(string(data))
		c.JSON(http.StatusOK, cart)
	})

	r.POST("/api/cart/add", func(c *gin.Context) {
		var req types.AddToCartRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		item, err := service.AddToCart(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, item)
	})

	r.POST("/api/cart/update", func(c *gin.Context) {
		var req types.UpdateCartRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := service.UpdateCartItem(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	})

	r.POST("/api/cart/clear", func(c *gin.Context) {
		var req types.ClearCartRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		err := service.ClearCart(req.UserID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.Status(http.StatusOK)
	})

	// --- User & Profile Endpoints ---

	r.POST("/api/data/getdataProfile", func(c *gin.Context) {
		log.Println("req recievef")
		var req types.ProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		profile, err := service.GetProfile(req.UserID)
		fmt.Println(profile)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, profile)
	})

	r.POST("/api/data/update", func(c *gin.Context) {
		var req types.UpdateProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		updated, err := service.UpdateProfile(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, updated)
	})

	r.Run(":8080")
}
