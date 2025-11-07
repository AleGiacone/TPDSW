// import app from '../app.js';
// import request from 'supertest';


// describe('Cuidador Tests', () => {

//   test('Should create a new cuidador successfully', async () => {
//     const response = await request(app)
//       .post('/api/cuidadores')
//       .send({
//         nombre: 'Juan',
//         email:'Juancineldelquinto@gmail.com',
//         password: 'miraQuelindosSomosenHD',
//         nroDocumento: '696969420',
//         tipoDocumento: 'DNI',
//         telefono: '1234567890',
//         sexoCuidador: 'Masculino',
//         descripcion: 'Cuidador con experiencia'

//       });

//     console.log(response.error);
//     expect(response.status).toBe(200);

//   });

//   test('Should delete the new cuidador successfully', async () => {
//     const foundByEmail = await request(app)
//     .post(`/api/cuidadores/email/`)
//     .send({ email: 'Juancineldelquinto@gmail.com' });
//     const id = foundByEmail.body.data.idUsuario;
//     console.log(foundByEmail.body);
//     const response = await request(app)
//     .delete(`/api/cuidadores/${id}`);
//     console.log(response.error);
//     expect(response.status).toBe(200);
//   })

//   test('Should find cuidadores', async  () => {

//     const response = await request(app)
//     .get('/api/cuidadores');
//     expect(response.status).toBe(200);

//     expect(response.body).toBeInstanceOf(Object);
//   })
// })
 
