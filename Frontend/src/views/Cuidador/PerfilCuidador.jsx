// Perfil.jsx
import { useEffect, useState } from "react";

export default function Perfil() {
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3307/api/cuidadores/dashboard", { credentials: "include" })
      .then(res => res.json())
      .then(data => setPerfil(data.perfil));
  }, []);

  const handleLogout = async () => {
    await fetch("http://localhost:3307/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  if (!perfil) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Perfil de {perfil.nombre}</h1>
      <p>{perfil.descripcion}</p>
      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}
