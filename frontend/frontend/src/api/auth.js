// /api/auth.js
const API_URL = 'https://tubackend.com/api'; // Reemplazá por tu URL real

export async function login(email, password) {
  return fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });
}

export async function register(nombre, email, password) {
  return fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nombre, email, password })
  });
}
