import type { Persona } from "../context/PersonaContext";

type BackendPersona = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

type PersonasResponse = {
  personas: BackendPersona[];
};

type RewriteRequest = {
  text: string;
  personaID: string;
};

type RewriteResponse = {
  transformId: string;
  personaId: string;
  personaName: string;
  originalText: string;
  transformedText: string;
};

const imageByPersonaName: Record<string, { uri: string }> = {
  Shakespeare: {
    uri: "https://upload.wikimedia.org/wikipedia/commons/3/36/Shakespeare_Droeshout_1623.jpg",
  },
  "Gen Z": {
    uri: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  },
  "Painfully Normal Man": {
    uri: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  },
};

const fallbackPersonaImage = {
  uri: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=600&q=80",
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function parseError(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.error === "string") return body.error;
  } catch {
    // Ignore parse errors and fallback to generic status messaging.
  }
  return `Request failed with status ${response.status}`;
}

export async function getPersonas(): Promise<Persona[]> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/personas`);
  } catch {
    throw new Error(`Cannot reach API at ${API_BASE_URL}. Is backend running?`);
  }
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const data = (await response.json()) as PersonasResponse;
  return data.personas.map((persona) => ({
    id: persona.id,
    name: persona.name,
    description: persona.description,
    image: imageByPersonaName[persona.name] ?? fallbackPersonaImage,
  }));
}

export async function rewriteText(payload: RewriteRequest): Promise<RewriteResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/rewrite`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(`Cannot reach API at ${API_BASE_URL}. Is backend running?`);
  }

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return (await response.json()) as RewriteResponse;
}
