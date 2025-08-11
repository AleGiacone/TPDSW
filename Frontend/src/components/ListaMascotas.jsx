import React, { useState, useEffect } from "react";

function ListaMascotas() {
  const [mascotas, setMascotas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:3307/api/mascotas") 
      .then((res) => {
        if (!res.ok) {
          throw new Error("Error en la respuesta del servidor");
        }
        return res.json();
      })
      .then((data) => {
        setMascotas(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener las mascotas:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Cargando mascotas...</p>;
  }

  return (
    <div>
      <h2>Lista de Mascotas</h2>
      <ul>
        {mascotas.map((mascota) => (
          <li key={mascota._id}>
            <strong>{mascota.nombre}</strong> - {mascota.tipo}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaMascotas;
