import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';
import '../../styles/HomePage.css';

const API_URL = 'http://localhost:3000/api';

function HomePage() {
  const { user } = useAuth();
  const [usuario, setUsuario] = useState(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch(`${API_URL}/usuario/me`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const data = await response.json();
          setUsuario(data.usuario);
        }
      } catch (error) {
        console.error('Error al obtener el usuario:', error);
      }
    };
    fetchUsuario();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: '15,000+', label: 'Mascotas Cuidadas' },
    { number: '8,500+', label: 'Cuidadores Verificados' },
    { number: '12,000+', label: 'Dueños Satisfechos' },
    { number: '4.9', label: 'Calificación Promedio', showStars: true },
  ];

  const testimonials = [
    {
      name: 'María González',
      role: 'Dueña de Luna (Golden Retriever)',
      rating: 5,
      text: 'Encontré el cuidador perfecto para Luna en menos de 24 horas. La experiencia fue increíble, recibí actualizaciones diarias con fotos y videos. ¡Totalmente recomendado!',
      location: 'Buenos Aires',
    },
    {
      name: 'Carlos Méndez',
      role: 'Cuidador Profesional',
      rating: 5,
      text: 'Como cuidador certificado, Petsbnb me permitió convertir mi pasión por los animales en un ingreso estable. La plataforma es fácil de usar y los dueños son muy respetuosos.',
      location: 'Rosario',
    },
    {
      name: 'Ana Rodríguez',
      role: 'Dueña de Michi y Pelusa (Gatos)',
      rating: 5,
      text: 'Viajé por tres semanas y mis gatos estuvieron en excelentes manos. El cuidador me enviaba videos todos los días y pude disfrutar mis vacaciones sin preocupaciones.',
      location: 'Córdoba',
    },
  ];

  const features = [
    {
      icon: '🛡️',
      title: 'Verificación Completa',
      description: 'Todos nuestros cuidadores pasan por un riguroso proceso de verificación de antecedentes y certificaciones.',
    },
    {
      icon: '📍',
      title: 'Cerca tuyo',
      description: 'Encuentra cuidadores en tu zona que se adapten perfectamente a las necesidades de tu mascota.',
    },
    {
      icon: '📅',
      title: 'Reserva Flexible',
      description: 'Programa el cuidado con anticipación o encuentra opciones de último momento según tu necesidad.',
    },
    {
      icon: '❤️',
      title: 'Amor Garantizado',
      description: 'Cuidadores apasionados que tratan a tu mascota como parte de su familia durante toda la estadía.',
    },
  ];

  const StarRating = ({ rating }) => (
    <div className="star-rating">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < rating ? 'star-filled' : 'star-empty'}>★</span>
      ))}
    </div>
  );

  return (
    <main className="homepage">

      {/* ── HERO ── */}
      <section className="hero-section">
        <div className="hero-content">
          {usuario ? (
            <>
              <h1 className="hero-title">¡Bienvenido de vuelta, {user?.nombre}! 🐾</h1>
              <p className="hero-subtitle">
                Qué bueno verte otra vez. ¿Buscás un cuidador o querés revisar tus reservas?
              </p>
              <div className="hero-actions">
                <Link to="/publicaciones" className="btn-primary">Ver cuidadores</Link>
                <Link to="/mis-reservas" className="btn-secondary">Mis reservas</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="hero-title">Bienvenido a Petsbnb 🐾</h1>
              <p className="hero-subtitle">
                Encontrá el cuidador ideal para tu mascota o compartí tu hogar cuidando animales.
                Conectamos dueños y cuidadores con confianza, amor y facilidad.
              </p>
              <div className="hero-cta">
                <Link to="/register" className="btn-primary">Comenzar ahora</Link>
                <Link to="/login" className="btn-secondary">Iniciar Sesión</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              {stat.showStars && <StarRating rating={5} />}
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about-section">
        <h2 className="section-title">¿Quiénes somos?</h2>
        <p className="about-text">
          Petsbnb es la plataforma líder en Argentina que conecta dueños de mascotas con cuidadores
          confiables y verificados. Desde 2020, hemos facilitado miles de conexiones exitosas,
          brindando tranquilidad a los dueños y hogares amorosos para las mascotas. Nuestra misión
          es crear una comunidad donde cada mascota reciba el cuidado y amor que merece, mientras
          sus dueños pueden viajar o trabajar con total confianza.
        </p>
      </section>

      {/* ── FEATURES ── */}
      <section className="features-section">
        <h2 className="section-title">¿Por qué elegirnos?</h2>
        <div className="features-grid">
          {features.map((f, i) => (
            <div key={i} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-description">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="testimonials-section">
        <h2 className="section-title">Lo que dicen nuestros usuarios</h2>
        <div className="testimonial-container">
          <div className="testimonial-card">
            <StarRating rating={testimonials[activeTestimonial].rating} />
            <p className="testimonial-text">"{testimonials[activeTestimonial].text}"</p>
            <div className="testimonial-author">
              <strong>{testimonials[activeTestimonial].name}</strong>
              <span className="testimonial-role">{testimonials[activeTestimonial].role}</span>
              <span className="testimonial-location">📍 {testimonials[activeTestimonial].location}</span>
            </div>
          </div>
          <div className="testimonial-dots">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`dot ${i === activeTestimonial ? 'active' : ''}`}
                onClick={() => setActiveTestimonial(i)}
                aria-label={`Ver testimonio ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <h2 className="cta-title">¿Listo para comenzar?</h2>
        <p className="cta-text">
          Unite a nuestra comunidad y descubrí por qué miles de personas confían en Petsbnb
          para el cuidado de sus mascotas.
        </p>
        {usuario
          ? <Link to="/publicaciones" className="btn-cta">Explorar cuidadores</Link>
          : <Link to="/register" className="btn-cta">Registrate gratis</Link>
        }
      </section>

    </main>
  );
}

export default HomePage;