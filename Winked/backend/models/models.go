package models

import(
	"time"
	"gorm.io/gorm"
)

//type User struct {
//	ID        string    `gorm:"column:id;type:uuid;primaryKey" json:"id"`
//	Email     string    `gorm:"unique;not null" json:"email"`
//	Password  string    `gorm:"column:password_hash;not null" json:"-"` // "-" means don't include in JSON
//	Username  string    `gorm:"not null" json:"username"`
//	CreatedAt time.Time `json:"createdAt"`
//	UpdatedAt time.Time `json:"updatedAt"`		

	// Relationships
//	Transforms []Transform `gorm:"foreignKey:UserID" json:"transforms,omitempty"`
//}

type Persona struct {
	ID          string    `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	ImageURL    string    `gorm:"column:image_url" json:"imageUrl"`
	
	// Relationships
	Prompts    []Prompt    `gorm:"foreignKey:PersonaID" json:"prompts,omitempty"`
	Transforms []Transform `gorm:"foreignKey:PersonaID" json:"transforms,omitempty"`
}

type Prompt struct {
	ID          string  `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	PersonaID   string  `gorm:"column:persona_id;type:uuid;not null" json:"personaId"`
	PromptStyle string  `gorm:"column:prompt_style;type:text;not null" json:"promptStyle"`
	Enabled     bool    `gorm:"default:true" json:"enabled"`
	
	// Relationships
	Persona    Persona     `gorm:"foreignKey:PersonaID" json:"persona,omitempty"`
	Transforms []Transform `gorm:"foreignKey:PromptsID" json:"transforms,omitempty"`
}

type Transform struct {
	ID         string         `gorm:"column:id;type:uuid;primaryKey" json:"id"`
//	UserID     string         `gorm:"column:user_id;type:uuid;not null" json:"userId"`
	PersonaID  string         `gorm:"column:persona_id;type:uuid;not null" json:"personaId"`
	PromptsID  string         `gorm:"column:prompts_id;type:uuid;not null" json:"promptsId"`
	InputText  *string        `gorm:"column:input_text;type:text" json:"inputText"`
	OutputText *string        `gorm:"column:output_text;type:text" json:"outputText"`
	IsDeleted  bool           `gorm:"column:is_deleted;default:false" json:"isDeleted"`
	CreatedAt  time.Time      `json:"createdAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"` // Soft delete support
	
	// Relationships
//	User    User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Persona Persona `gorm:"foreignKey:PersonaID" json:"persona,omitempty"`
	Prompt  Prompt  `gorm:"foreignKey:PromptsID" json:"prompt,omitempty"`
}

// TableName specifies custom table names
//func (User) TableName() string {
//	return "users"
//}

func (Persona) TableName() string {
	return "personas"
}

func (Prompt) TableName() string {
	return "prompts"
}

func (Transform) TableName() string {
	return "transform"
}
