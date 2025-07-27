import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Navbar.css';
const API_URL = 'http://localhost:3000/api'; // Reemplazá 




async function HomePage() {

  const response = await fetch(`${API_URL}/usuario/me`, {
    method: 'GET',
    credentials: 'include', // obligatorio
  });

  if (response.ok) {
    const data = await response.json();
    console.log('Usuario logueado:', data.usuario);
  } else {
    console.log('No autenticado');
  }



return (
  <div className="page-wrapper">
  <main>
    <h1>Bienvenido a Petsbnb!</h1>
    <h2>Cuidamos lo que más querés :)</h2>
    <p> En Petsbnb, encontrá el cuidador ideal para tu mascota o compartí tu hogar cuidando animales. Conectamos dueños y cuidadores con confianza, amor y facilidad.</p>
  </main>
</div>
  );

}

export default HomePage;