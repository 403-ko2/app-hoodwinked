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

var ErrMissingAPIKey = errors.New("OPENAI_API_KEY is not set")

type chatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []chatMessage `json:"messages"`
	Temperature float32       `json:"temperature,omitempty"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
}

type chatMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type chatCompletionResponse struct {
	Choices []struct {
		Message chatMessage `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error,omitempty"`
}

func RewriteText(promptStyle string, inputText string) (string, error) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return "", ErrMissingAPIKey
	}

	model := os.Getenv("OPENAI_MODEL")
	if model == "" {
		model = "gpt-4o-mini"
	}

	reqBody := chatCompletionRequest{
		Model: model,
		Messages: []chatMessage{
			{
				Role:    "system",
				Content: "You are a rewriting assistant. Rewrite text to match persona instructions while preserving original meaning.",
			},
			{
				Role:    "user",
				Content: fmt.Sprintf("Persona instructions: %s\n\nText to rewrite: %s", promptStyle, inputText),
			},
		},
		Temperature: 0.8,
		MaxTokens:   500,
	}

	payload, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("failed to encode OpenAI request: %w", err)
	}

	client := &http.Client{Timeout: 25 * time.Second}
	req, err := http.NewRequest(http.MethodPost, "https://api.openai.com/v1/chat/completions", bytes.NewReader(payload))
	if err != nil {
		return "", fmt.Errorf("failed to create OpenAI request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("OpenAI request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("failed reading OpenAI response: %w", err)
	}

	var decoded chatCompletionResponse
	if err := json.Unmarshal(body, &decoded); err != nil {
		return "", fmt.Errorf("failed to decode OpenAI response: %w", err)
	}

	if resp.StatusCode >= 400 {
		if decoded.Error != nil && decoded.Error.Message != "" {
			return "", fmt.Errorf("OpenAI API error: %s", decoded.Error.Message)
		}
		return "", fmt.Errorf("OpenAI API returned status %d", resp.StatusCode)
	}

	if len(decoded.Choices) == 0 {
		return "", errors.New("OpenAI response contained no choices")
	}

	return decoded.Choices[0].Message.Content, nil
}
