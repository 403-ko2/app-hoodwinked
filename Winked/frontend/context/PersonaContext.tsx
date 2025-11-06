import React, { createContext, useContext, useState } from "react";

type Persona = {
  id: string;
  name: string;
  image: any;
} | null;

type PersonaContextType = {
  selectedPersona: Persona;
  setSelectedPersona: (persona: Persona) => void;
};

const PersonaContext = createContext<PersonaContextType>({
  selectedPersona: null,
  setSelectedPersona: () => {},
});

export const PersonaProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(null);
  return (
    <PersonaContext.Provider value={{ selectedPersona, setSelectedPersona }}>
      {children}
    </PersonaContext.Provider>
  );
};

export const usePersona = () => useContext(PersonaContext);
