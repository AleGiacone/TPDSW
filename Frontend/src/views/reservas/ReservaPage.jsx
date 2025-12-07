import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PublicacionesGrid from '../../components/PublicacionesGrid';
import PublicacionCard from '../../components/PublicacionCard';

const ReservarPage = () => {
  const { publicacionId } = useParams(); // Si viene desde la URL
  const { user } = useAuth();
  const navigate = useNavigate();
  const API_BASE_URL = 'http://localhost:3000/api';

  const [publicacionSeleccionada, setPublicacionSeleccionada] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Datos de la reserva
  const [reservaData, setReservaData] = useState({
    fechaInicio: '',
    fechaFin: '',
    mascotaId: '',
    notas: ''
  });

  // Fetch de publicaciones (si no viene publicacionId en la URL)
  useEffect(() => {
    const fetchData = async () => {
      if (publicacionId) {
        // Si viene el ID, fetch solo esa publicación
        await fetchPublicacionById(publicacionId);
      } else {
        // Si no, mostrar todas para que seleccione
        await fetchPublicaciones();
      }
    };
    fetchData();
  }, [publicacionId]);

  const fetchPublicacionById = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/publicacion/${id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar la publicación');
      const data = await response.json();
      setPublicacionSeleccionada(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPublicaciones = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/publicacion`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Error al cargar publicaciones');
      const data = await response.json();
      setPublicaciones(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (pub) => {
    setPublicacionSeleccionada(pub);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setReservaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitReserva = async (e) => {
    e.preventDefault();

    if (!publicacionSeleccionada) {
      alert('Por favor selecciona una publicación');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/reserva`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicacionId: publicacionSeleccionada.idPublicacion || publicacionSeleccionada.id,
          ...reservaData
        })
      });

      if (!response.ok) throw new Error('Error al crear la reserva');

      alert('¡Reserva creada exitosamente!');
      navigate('/mis-reservas');
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Hacer una Reserva</h1>

        {/* Si no hay publicación seleccionada, mostrar grid para seleccionar */}
        {!publicacionSeleccionada ? (
          <div>
            <h2 className="text-xl mb-4">Selecciona una publicación:</h2>
            <PublicacionesGrid
              publicaciones={publicaciones}
              loading={loading}
              error={error}
              onRetry={fetchPublicaciones}
              emptyMessage="No hay publicaciones disponibles"
              showCuidadorInfo={true}
              isSelectable={true}
              onCardClick={handleCardClick}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda: Publicación seleccionada */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Publicación seleccionada:</h2>
                {!publicacionId && (
                  <button
                    onClick={() => setPublicacionSeleccionada(null)}
                    className="btn-secondary"
                  >
                    Cambiar
                  </button>
                )}
              </div>
              <PublicacionCard
                publicacion={publicacionSeleccionada}
                showActions={false}
                showCuidadorInfo={true}
              />
            </div>

            {/* Columna derecha: Formulario de reserva */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Detalles de la reserva</h2>
              <form onSubmit={handleSubmitReserva} className="space-y-4">
                <div>
                  <label className="block mb-2">Fecha de inicio:</label>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={reservaData.fechaInicio}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2">Fecha de fin:</label>
                  <input
                    type="date"
                    name="fechaFin"
                    value={reservaData.fechaFin}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  />
                </div>

                <div>
                  <label className="block mb-2">Mascota:</label>
                  <select
                    name="mascotaId"
                    value={reservaData.mascotaId}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Seleccionar mascota...</option>
                    {/* Aquí mapearías las mascotas del usuario */}
                  </select>
                </div>

                <div>
                  <label className="block mb-2">Notas adicionales:</label>
                  <textarea
                    name="notas"
                    value={reservaData.notas}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full p-2 border rounded"
                    placeholder="Información importante sobre tu mascota..."
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg">Precio por día:</span>
                    <span className="text-2xl font-bold text-orange-500">
                      ${publicacionSeleccionada.tarifaPorDia}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="w-full btn-primary py-3 text-lg"
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservarPage;