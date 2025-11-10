package seeds

import (
	"backend/database"
	"backend/models"
	"github.com/google/uuid"
)

// PersonaIDs stores created persona IDs for reference in other seeds
var PersonaIDs = make(map[string]string)

func SeedPersonas() {
	personas := []models.Persona{
		{
			ID:          uuid.New().String(),
			Name:        "Shakespeare",
			Description: "Elizabethan English with dramatic flair",
			ImageURL:    "shakespeare.png",
		},
		{
			ID:          uuid.New().String(),
			Name:        "Gen Z",
			Description: "Modern slang and internet culture",
			ImageURL:    "gen-z.png",
		},
		{
			ID:          uuid.New().String(),
			Name:        "Painfully Normal Man",
			Description: "Overall nice and regular guy to the point that its obnoxious",
			ImageURL:    "professional.png",
		},
	}
	
	for _, persona := range personas {
		database.DB.Create(&persona)
		PersonaIDs[persona.Name] = persona.ID
	}
}
