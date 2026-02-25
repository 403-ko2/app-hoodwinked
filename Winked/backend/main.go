package main

import (
	"errors"
	"net/http"
	"os"
	"strconv"

	"backend/database"
	"backend/database/migrations"
	"backend/database/seeds"
	"backend/models"
	"backend/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"gorm.io/gorm"
)

type RewriteRequest struct {
	Text      string `json:"text" binding:"required"`
	PersonaID string `json:"personaID" binding:"required"`
}

type RewriteResponse struct {
	TransformID     string `json:"transformId"`
	PersonaID       string `json:"personaId"`
	PersonaName     string `json:"personaName"`
	OriginalText    string `json:"originalText"`
	TransformedText string `json:"transformedText"`
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
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "backend is running",
		})
	})

	r.GET("/personas", func(c *gin.Context) {
		var personas []models.Persona
		if err := database.DB.Find(&personas).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load personas"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"personas": personas})
	})

	r.POST("/rewrite", func(c *gin.Context) {
		var req RewriteRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "text and personaID are required"})
			return
		}

		var persona models.Persona
		if err := database.DB.Where("id = ?", req.PersonaID).First(&persona).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "persona not found"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load persona"})
			return
		}

		var prompt models.Prompt
		if err := database.DB.Where("persona_id = ? AND enabled = true", req.PersonaID).First(&prompt).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				c.JSON(http.StatusNotFound, gin.H{"error": "no enabled prompt for persona"})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load prompt"})
			return
		}

		outputText, err := services.RewriteText(prompt.PromptStyle, req.Text)
		if err != nil {
			if errors.Is(err, services.ErrMissingAPIKey) {
				c.JSON(http.StatusServiceUnavailable, gin.H{
					"error": "OPENAI_API_KEY is not set. Add it to backend environment variables.",
				})
				return
			}

			c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
			return
		}

		inputText := req.Text
		transform := models.Transform{
			ID:         uuid.New().String(),
			PersonaID:  req.PersonaID,
			PromptsID:  prompt.ID,
			InputText:  &inputText,
			OutputText: &outputText,
		}

		if err := database.DB.Create(&transform).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save transform"})
			return
		}

		c.JSON(http.StatusOK, RewriteResponse{
			TransformID:     transform.ID,
			PersonaID:       req.PersonaID,
			PersonaName:     persona.Name,
			OriginalText:    req.Text,
			TransformedText: outputText,
		})
	})

	r.GET("/history", func(c *gin.Context) {
		limit := 20
		if l := c.Query("limit"); l != "" {
			parsed, err := strconv.Atoi(l)
			if err != nil || parsed <= 0 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "limit must be a positive integer"})
				return
			}
			if parsed > 100 {
				parsed = 100
			}
			limit = parsed
		}

		personaID := c.Query("personaID")
		query := database.DB.Preload("Persona").Order("created_at DESC").Limit(limit)
		if personaID != "" {
			query = query.Where("persona_id = ?", personaID)
		}

		var transforms []models.Transform
		if err := query.Find(&transforms).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load history"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"history": transforms})
	})

	// Start server on 8080 (this is default)
	// Server will listen on 0.0.0.0:8080 (localhost:8080 on Windows)
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	r.Run(":" + port)
}
