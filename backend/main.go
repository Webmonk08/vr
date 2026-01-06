package main

import (
	"log"
	"net/http"
	"os"
	"vr/services"
	"vr/types"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/supabase-community/supabase-go"
)

type updateRequest struct {
	ID   int           `json:"id"`
	DATA types.Product `json:"data"`
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	API_URL := os.Getenv("SUPABASE_API_URL")
	API_KEY := os.Getenv("SUPABASE_ANON_KEY")

	var initErr error
	supabaseClient, initErr := supabase.NewClient(API_URL, API_KEY, &supabase.ClientOptions{})
	service := services.NewService(supabaseClient)
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

		products, err := service.GetProducts()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, products)
	})

	r.POST("/api/users/update", func(c *gin.Context) {
		var req updateRequest

		if err := c.ShouldBindJSON(&req); err != nil {
			// If the JSON is invalid or types don't match, return 400
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := service.UpdateProducts(req.ID, req.DATA)

		println(err)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	})

	r.Run(":8080")
}
