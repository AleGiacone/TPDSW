import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Navbar.css';
const API_URL = 'http://localhost:3000/api'; // Reemplazá 




import { useEffect, useState } from 'react';

function HomePage() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`${API_URL}/usuario/me`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const data = await response.json();
          console.log("Data obtenida:", data);
          setUsuario(data.usuario); // ✅ guarda el usuario en estado
        } else {
          console.log('No autenticado');
        }
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      }
    };

    fetchUsuario();
  }, []); // ✅ se ejecuta una sola vez

  return (
    <div className="page-wrapper">
      <main>
        <h1>Bienvenido {usuario.nombre}! <br/>sonsa la que lea</h1>
        <h2>Cuidamos lo que más querés :)</h2>
        <p>
          {/* Este speech va para cuando no esta logueado en mi opinion 
            en /us sea donde ponga el speech de nosotros
          */}
          
          En Petsbnb, encontrá el cuidador ideal para tu mascota o compartí tu hogar cuidando animales.
          Conectamos dueños y cuidadores con confianza, amor y facilidad.
        </p>
        {usuario && <p>¡Hola, {usuario.email}!</p>}
      </main>
    </div>
  );
}

export default HomePage;