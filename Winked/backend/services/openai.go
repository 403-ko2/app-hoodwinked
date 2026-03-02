package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

var ErrMissingAPIKey = errors.New("GEMINI_API_KEY is not set")

type geminiGenerateRequest struct {
	SystemInstruction *geminiContent    `json:"system_instruction,omitempty"`
	Contents          []geminiContent   `json:"contents"`
	GenerationConfig  *generationConfig `json:"generationConfig,omitempty"`
}

type geminiContent struct {
	Role  string       `json:"role,omitempty"`
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text string `json:"text"`
}

type generationConfig struct {
	Temperature     float32 `json:"temperature,omitempty"`
	MaxOutputTokens int     `json:"maxOutputTokens,omitempty"`
}

type geminiGenerateResponse struct {
	Candidates []struct {
		Content *geminiContent `json:"content,omitempty"`
	} `json:"candidates"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func RewriteText(promptStyle string, inputText string) (string, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return "", ErrMissingAPIKey
	}

	model := os.Getenv("GEMINI_MODEL")
	if model == "" {
		model = "gemini-2.5-flash"
	}

	reqBody := geminiGenerateRequest{
		SystemInstruction: &geminiContent{
			Parts: []geminiPart{
				{
					Text: "You are a rewriting assistant. Rewrite text to match persona instructions while preserving original meaning.",
				},
			},
		},
		Contents: []geminiContent{
			{
				Role: "user",
				Parts: []geminiPart{
					{
						Text: fmt.Sprintf("Persona instructions: %s\n\nText to rewrite: %s", promptStyle, inputText),
					},
				},
			},
		},
		GenerationConfig: &generationConfig{
			Temperature:     0.8,
			MaxOutputTokens: 500,
		},
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to encode Gemini request: %w", err)
	}

	client := &http.Client{Timeout: 25 * time.Second}
	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s", model, apiKey)
	req, err := http.NewRequest(http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("Gemini request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed reading Gemini response: %w", err)
	}

	var decoded geminiGenerateResponse
	if err := json.Unmarshal(body, &decoded); err != nil {
		return "", fmt.Errorf("failed to decode Gemini response: %w", err)
	}

	if resp.StatusCode >= 400 {
		if decoded.Error != nil && decoded.Error.Message != "" {
			return "", fmt.Errorf("Gemini API error: %s", decoded.Error.Message)
		}
		return "", fmt.Errorf("Gemini API returned status %d", resp.StatusCode)
	}

	if len(decoded.Candidates) == 0 || decoded.Candidates[0].Content == nil || len(decoded.Candidates[0].Content.Parts) == 0 {
		return "", errors.New("Gemini response contained no candidates")
	}

	return decoded.Candidates[0].Content.Parts[0].Text, nil
}
