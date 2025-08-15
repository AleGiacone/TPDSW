
import { useEffect, useState } from "react";

export default function Dashboard() {
  const [publicaciones, setPublicaciones] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`http://localhost:3307/api/cuidadores/${user.id}/publicacion`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setPublicaciones(data));

    
  }, [user.id, token]);

  return (
    <div>
      <h1>Bienvenido {user.nombre}</h1>
      <h2>Mis Publicaciones</h2>
      <ul>
        {publicaciones.map(p => <li key={p.id}>{p.titulo}</li>)}
      </ul>

      <h2>Mis Reservas</h2>
    </div>
  );
}
