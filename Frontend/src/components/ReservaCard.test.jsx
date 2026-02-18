import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ReservaCard from '../components/ReservaCard';

// ── Datos de prueba (mock) ───────────────────────────────────────────────────
const reservaMock = {
  idReserva: 1,
  descripcion: 'Por favor cuiden bien a Firulais',
  fechaDesde: '2025-07-10',
  fechaHasta: '2025-07-12',
  diasReservados: ['2025-07-10', '2025-07-11', '2025-07-12'],
  mascotas: [
    {
      nomMascota: 'Firulais',
      especie: { nomEspecie: 'Perro' },
      raza: { nomRaza: 'Labrador' },
      edad: 3,
    },
  ],
  publicacion: {
    titulo: 'Casa acogedora en Palermo',
    tarifaPorDia: 1000,
    ubicacion: 'Palermo, CABA',
    tipoAlojamiento: 'Casa',
    imagenes: [],
    idCuidador: {
      nombre: 'Carlos Pérez',
      email: 'carlos@email.com',
      telefono: '1122334455',
    },
  },
  dueno: {
    nombre: 'María García',
    email: 'maria@email.com',
    telefono: '9988776655',
  },
};

// ── Tests ────────────────────────────────────────────────────────────────────
describe('ReservaCard', () => {

  it('muestra el título de la publicación', () => {
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={() => { }} />);
    expect(screen.getByText('Casa acogedora en Palermo')).toBeInTheDocument();
  });

  it('muestra el nombre de la mascota', () => {
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={() => { }} />);
    expect(screen.getByText('Firulais')).toBeInTheDocument();
  });

  it('muestra el badge de estado PENDIENTE por defecto', () => {
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={() => { }} />);
    expect(screen.getByText('PENDIENTE')).toBeInTheDocument();
  });

  it('muestra el botón "Cancelar Reserva" cuando userType es dueno', () => {
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={() => { }} />);
    expect(screen.getByText('Cancelar Reserva')).toBeInTheDocument();
  });

  it('NO muestra el botón "Cancelar Reserva" cuando userType es cuidador', () => {
    render(<ReservaCard reserva={reservaMock} userType="cuidador" onCancelar={() => { }} />);
    expect(screen.queryByText('Cancelar Reserva')).not.toBeInTheDocument();
  });

  it('expande los detalles al hacer click en "Ver más detalles"', () => {
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={() => { }} />);

    const btnExpandir = screen.getByText('▼ Ver más detalles');
    fireEvent.click(btnExpandir);

    // Aparece la nota y el botón cambia a "Ver menos"
    expect(screen.getByText('Por favor cuiden bien a Firulais')).toBeInTheDocument();
    expect(screen.getByText('▲ Ver menos')).toBeInTheDocument();
  });

  it('llama a onCancelar con el id correcto al cancelar', () => {
    const onCancelarMock = vi.fn(); // función espía
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={onCancelarMock} />);

    fireEvent.click(screen.getByText('Cancelar Reserva'));

    expect(onCancelarMock).toHaveBeenCalledTimes(1);
    expect(onCancelarMock).toHaveBeenCalledWith(1); // idReserva = 1
  });

  it('calcula y muestra el total correctamente (2 días × $1000)', () => {
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={() => { }} />);
    // 3 días reservados → (3-1) * 1000 = $2000
    expect(screen.getByText('$2000')).toBeInTheDocument();
  });

  it('muestra el cuidador cuando userType es dueno', () => {
    render(<ReservaCard reserva={reservaMock} userType="dueno" onCancelar={() => { }} />);
    expect(screen.getByText(/Carlos Pérez/)).toBeInTheDocument();
  });

  it('muestra el dueño cuando userType es cuidador', () => {
    render(<ReservaCard reserva={reservaMock} userType="cuidador" onCancelar={() => { }} />);
    expect(screen.getByText(/María García/)).toBeInTheDocument();
  });

});