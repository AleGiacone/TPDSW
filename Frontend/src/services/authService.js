/* Este archivo es el servicio de la API. Su única responsabilidad es contener toda la lógica de las peticiones HTTP (fetch) relacionadas con la autenticación.

¿Qué va aquí?

Funciones de peticiones: loginCtrl, logoutCtrl y register que contienen el fetch y manejan la comunicación con tu backend.

La URL de la API: Una constante API_URL para no tener que escribir la URL en cada función.

Headers y configuraciones: Los headers como 'Content-Type', 'credentials', etc., se definen aquí.

En resumen: En este archivo, te enfocas en cómo se hacen las peticiones a la API, manteniendo esta lógica separada del estado de React y de tus componentes. */

const API_URL = 'http://localhost:3000/api';

export async function loginCtrl(email, password) {
  return fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
  });
}

export async function registerCtrl(formData) {
  const endpoint = formData.tipoUsuario === 'cuidador' 
    ? `${API_URL}/cuidadores`
    : `${API_URL}/duenos`;

  return fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  });
}

export async function logoutCtrl() {
  return fetch(`http://localhost:3000/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}