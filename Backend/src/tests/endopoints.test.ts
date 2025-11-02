import app from '../app.js'
import request from 'supertest';

describe('Testear todos los endpoints', () => {
  test('Cuidador endpoint', async () => {
    const response = await request(app)
    .get('/api/cuidadores');
    expect(response.status).toBe(200);
  })

  test('Dueño endpoint', async () => {
    const response = await request(app)
    .get('/api/duenos');
    expect(response.status).toBe(200);
  })

  test('Especie endpoint', async () => {
    const response = await request(app)
    .get('/api/especies');
    expect(response.status).toBe(200);
  });

  test('Mascota endpoint', async () => {
    const response = await request(app)
    .get('/api/mascotas');
    expect(response.status).toBe(200);
  });

  test('Raza endpoint', async () => {
    const response = await request(app)
    .get('/api/razas');
    expect(response.status).toBe(200);
  });

  test('Publicacion endpoint', async () => {
    const response = await request(app)
    .get('/api/publicacion');
    expect(response.status).toBe(200);
  })



})

