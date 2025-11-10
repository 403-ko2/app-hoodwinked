package seeds

import (
	"log"
	"backend/database"
	"backend/models"
	"github.com/google/uuid"
)

func SeedPrompts() {
	log.Println("Persona IDs:", PersonaIDs)

	prompts := []models.Prompt{
		{
			ID:          uuid.New().String(),
			PersonaID:   PersonaIDs["Shakespeare"],
			PromptStyle: "Rewrite the following text in Elizabethan English...",
			Enabled:     true,
		},
		{
			ID:          uuid.New().String(),
			PersonaID:   PersonaIDs["Gen Z"],
			PromptStyle: "Rewrite the following text using Gen Z slang...",
			Enabled:     true,
		},
		{
			ID:          uuid.New().String(),
			PersonaID:   PersonaIDs["Painfully Normal Man"],
			PromptStyle: "Rewrite the following text in a formal, professional tone...",
			Enabled:     true,
		},
	}
	
	for _, prompt := range prompts {
		database.DB.Create(&prompt)
	}
}
