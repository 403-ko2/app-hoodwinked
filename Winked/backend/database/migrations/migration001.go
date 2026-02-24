package migrations

import (
	"backend/database"
	"backend/models"
	"log"
)

// Migrate runs auto-migrations for all models
func Migrate() {
	err := database.DB.AutoMigrate(
	//	&models.User{},
		&models.Persona{},
		&models.Prompt{},
		&models.Transform{},
	)
	
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}
	
	log.Println("Database migration completed.")
}
