package main

import (
	"fmt"
	"net/http"
	"os"

	"backend/database"
	"backend/database/seeds"
	"backend/database/migrations"
//	"backend/models"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type TransformRequest struct {
	Text string `json:"text" binding:"required"`
	PersonaID string `json:"personaID" binding:"required"`
}

type TransformResponse struct {
	OriginalText string `json:"originalText"`
	TransformedText string `json:"transformedText"`
	Persona string `json:"persona"`
}

func main() {
	godotenv.Load()
	database.Connect()
	migrations.Migrate()
	seeds.Run()
	
	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/", func(c *gin.Context){
		
		c.JSON(http.StatusOK, gin.H{
			"message": "backend is running dude",
		})
		fmt.Println("were good to go gopher")
	})

	// Start server on 8080 (this is default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	
	r.Run(":" + port)

	



}
