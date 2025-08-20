import { createContext, useContext, useState } from "react";

const RegisterContext = createContext();

export function RegisterProvider({ children }) {
  const [userData, setUserData] = useState({});
  const [farmData, setFarmData] = useState({});

  return (
    <RegisterContext.Provider value={{ userData, setUserData, farmData, setFarmData }}>
      {children}
    </RegisterContext.Provider>
  );
}

export function useRegister() {
  return useContext(RegisterContext);
} 