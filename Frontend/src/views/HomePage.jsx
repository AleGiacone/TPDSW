import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import '../styles/Navbar.css';

export default function HomePage() {
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
