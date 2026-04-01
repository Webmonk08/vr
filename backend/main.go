package main

import (
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

func handleError(c *gin.Context, err error) {
	if apiErr, ok := err.(*types.APIError); ok {
		c.JSON(apiErr.StatusCode, apiErr)
		return
	}
	c.JSON(http.StatusInternalServerError, types.APIError{
		StatusCode: http.StatusInternalServerError,
		Code:       types.ErrCodeInternal,
		Message:    "An unexpected error occurred",
		Details:    err.Error(),
	})
}

func recoveryMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		defer func() {
			if err := recover(); err != nil {
				log.Printf("Panic recovered: %v", err)
				c.JSON(http.StatusInternalServerError, types.APIError{
					StatusCode: http.StatusInternalServerError,
					Code:       types.ErrCodeInternal,
					Message:    "An unexpected error occurred. Please try again later.",
				})
				c.Abort()
			}
		}()
		c.Next()
	}
}

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
	storageService := services.NewStorageService(supabaseClient)

	r := gin.Default()
	r.Use(recoveryMiddleware())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// --- Health Check ---
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// --- Storage Endpoints ---
	r.POST("/api/upload", func(c *gin.Context) {
		file, err := c.FormFile("image")
		if err != nil {
			handleError(c, types.BadRequest("No image file provided"))
			return
		}

		f, err := file.Open()
		if err != nil {
			handleError(c, types.InternalServerError("Failed to open image file"))
			return
		}
		defer f.Close()

		fileName := services.GenerateUniqueFileName(file.Filename)
		url, err := storageService.UploadImage("product_images", &services.FileInfo{
			FileName:    fileName,
			Content:     f,
			ContentType: file.Header.Get("Content-Type"),
		})

		if err != nil {
			handleError(c, err)
			return
		}

		c.JSON(http.StatusOK, gin.H{"url": url})
	})

	// --- Products Endpoints ---

	r.GET("/api/products/getAll", func(c *gin.Context) {
		products, err := service.GetProducts()
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, products)
	})

	r.POST("/api/products/create", func(c *gin.Context) {
		contentType := c.GetHeader("Content-Type")
		if contentType == "" || contentType == "application/json" {
			var product types.Product
			fmt.Println("product", c.Request.Body)
			if err := c.ShouldBindJSON(&product); err != nil {
				handleError(c, types.BadRequest(err.Error()))
				return
			}
			fmt.Println("product", product)
			created, err := service.CreateProduct(product)
			if err != nil {
				handleError(c, err)
				return
			}
			
			c.JSON(http.StatusOK, created)
		}else {
			handleError(c, types.BadRequest("Unsupported Content-Type"))
			return
		}
	})

	r.POST("/api/products/update/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			handleError(c, types.BadRequest("Invalid ID"))
			return
		}

		type UpdateReq struct {
			ID   int           `json:"id"`
			Data types.Product `json:"data"`
		}
		var req UpdateReq
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}

		updated, err := service.UpdateProduct(id, req.Data)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, updated)
	})

	r.DELETE("/api/products/delete/:id", func(c *gin.Context) {
		idStr := c.Param("id")
		id, err := strconv.Atoi(idStr)
		if err != nil {
			handleError(c, types.BadRequest("Invalid ID"))
			return
		}
		err = service.DeleteProduct(id)
		if err != nil {
			handleError(c, err)
			return
		}
		c.Status(http.StatusOK)
	})

	// --- Cart Endpoints ---

	r.GET("/api/cart/get", func(c *gin.Context) {
		userID := c.Query("user_id")
		if userID == "" {
			handleError(c, types.BadRequest("user_id is required"))
			return
		}
		cart, err := service.GetCart(userID)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, cart)
	})

	r.POST("/api/cart/add", func(c *gin.Context) {
		var req types.AddToCartRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		item, err := service.AddToCart(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, item)
	})

	r.POST("/api/cart/remove", func(c *gin.Context) {
		var req types.RemoveFromCartRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		err := service.RemoveFromCart(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.Status(http.StatusOK)
	})

	r.POST("/api/cart/update", func(c *gin.Context) {
		var req types.UpdateCartRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		err := service.UpdateCartItem(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.Status(http.StatusOK)
	})

	r.POST("/api/cart/clear", func(c *gin.Context) {
		var req types.ClearCartRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		err := service.ClearCart(req.UserID)
		if err != nil {
			handleError(c, err)
			return
		}
		c.Status(http.StatusOK)
	})

	// --- User & Profile Endpoints ---

	r.POST("/api/data/getdataProfile", func(c *gin.Context) {
		var req types.ProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		profile, err := service.GetProfile(req.UserID)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, profile)
	})

	r.POST("/api/data/update", func(c *gin.Context) {
		var req types.UpdateProfileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		updated, err := service.UpdateProfile(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, updated)
	})

	// --- Auth Endpoints ---

	r.POST("/api/auth/signup", func(c *gin.Context) {
		var req types.AuthRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		res, err := service.SignUp(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, res)
	})

	r.POST("/api/auth/login", func(c *gin.Context) {
		var req types.AuthRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		res, err := service.SignIn(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, res)
	})

	r.POST("/api/auth/logout", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if err := service.SignOut(token); err != nil {
			handleError(c, err)
			return
		}
		c.Status(http.StatusOK)
	})

	r.POST("/api/auth/change-password", func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		var req types.ChangePasswordRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		res, err := service.ChangePassword(token, req.Password)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, res)
	})

	r.GET("/api/auth/role", func(c *gin.Context) {
		userID := c.Query("userId")
		if userID == "" {
			handleError(c, types.BadRequest("userId required"))
			return
		}
		role, err := service.GetUserRole(userID)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"role": role})
	})

	// --- User Management Endpoints ---

	r.GET("/api/users/getAll", func(c *gin.Context) {
		users, err := service.GetAllUsers()
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, users)
	})

	r.POST("/api/users/create", func(c *gin.Context) {
		var req types.CreateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		user, err := service.CreateUser(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusCreated, user)
	})

	r.PUT("/api/users/update/:id", func(c *gin.Context) {
		userID := c.Param("id")
		var req types.UpdateUserRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		user, err := service.UpdateUser(userID, req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, user)
	})

	r.DELETE("/api/users/delete/:id", func(c *gin.Context) {
		userID := c.Param("id")
		err := service.DeleteUser(userID)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "User deleted successfully"})
	})

	// --- Orders Endpoints ---

	r.GET("/api/orders/getAll", func(c *gin.Context) {
		orders, err := service.GetAllOrders()
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, orders)
	})

	r.GET("/api/orders/user", func(c *gin.Context) {
		userID := c.Query("user_id")
		if userID == "" {
			handleError(c, types.BadRequest("user_id is required"))
			return
		}
		orders, err := service.GetOrdersByUser(userID)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, orders)
	})

	r.POST("/api/orders/create", func(c *gin.Context) {
		var req types.CreateOrderRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		order, err := service.CreateOrder(req)
		if err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusCreated, order)
	})

	r.PUT("/api/orders/update-status/:id", func(c *gin.Context) {
		orderID := c.Param("id")
		var req types.UpdateOrderStatusRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			handleError(c, types.BadRequest(err.Error()))
			return
		}
		if err := service.UpdateOrderStatus(orderID, req.Status); err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Order status updated"})
	})

	r.DELETE("/api/orders/delete/:id", func(c *gin.Context) {
		orderID := c.Param("id")
		if err := service.DeleteOrder(orderID); err != nil {
			handleError(c, err)
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Order deleted"})
	})

	r.Run(":8080")
}
