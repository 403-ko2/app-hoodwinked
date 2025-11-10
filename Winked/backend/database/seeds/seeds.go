package seeds

import (
	"log"
	"backend/database"
	"backend/models"
)

// Run executes all seed functions
func Run() {
	var count int64
	database.DB.Model(&models.Persona{}).Count(&count)
	
	if count == 0 {
		log.Println("Seeding database...")

		SeedPersonas()

		database.DB.Exec("COMMIT;")

		SeedPrompts()

		log.Println("Database seeded successfully!")
	} else {
		log.Println("Database already seeded, skipping...")
	}
}
