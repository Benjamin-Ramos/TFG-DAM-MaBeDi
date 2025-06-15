import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import App from "./App";
import Login from "./pages/Login";

export default function Root() {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [doctorId, setDoctorId] = useState(null);
  const [checkingStorage, setCheckingStorage] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      try {
        const decoded = jwtDecode(savedToken);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (isExpired) {
          console.log("Token expirado, cerrando sesión automáticamente.");
          localStorage.clear();
          setToken(null);
          setRole(null);
          setDoctorId(null);
        } else {
          setToken(savedToken);
          const storedRole = localStorage.getItem("role");
          setRole(storedRole);

          if (storedRole === "Doctor") {
            const id =
              decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
            setDoctorId(id);
            localStorage.setItem("doctorId", id);
          }
        }
      } catch (err) {
        console.error("Error al decodificar el token:", err);
        localStorage.clear();
        setToken(null);
        setRole(null);
        setDoctorId(null);
      }
    }

    setCheckingStorage(false);
  }, []);

  const handleLogin = (receivedToken, receivedRole) => {
    localStorage.setItem("token", receivedToken);
    localStorage.setItem("role", receivedRole);
    setToken(receivedToken);
    setRole(receivedRole);

    if (receivedRole === "Doctor") {
      const decoded = jwtDecode(receivedToken);
      const id =
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      setDoctorId(id);
      localStorage.setItem("doctorId", id);
    } else {
      setDoctorId(null);
      localStorage.removeItem("doctorId");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
    setDoctorId(null);
  };

  if (checkingStorage) return null;

  if (!token || !role) return <Login onLogin={handleLogin} />;

  return (
    <App token={token} role={role} doctorId={doctorId} onLogout={handleLogout} />
  );
}