import React, { createContext, useContext, useState } from "react";

export type Persona = {
  id: string;
  name: string;
  image: any;
  description?: string;
};

type PersonaContextType = {
  selectedPersona: Persona | null;
  setSelectedPersona: (persona: Persona | null) => void;
};

const PersonaContext = createContext<PersonaContextType>({
  selectedPersona: null,
  setSelectedPersona: () => {},
});

export const PersonaProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  return (
    <PersonaContext.Provider value={{ selectedPersona, setSelectedPersona }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = () => useContext(PersonaContext);
