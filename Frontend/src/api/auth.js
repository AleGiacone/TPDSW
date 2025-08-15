// /api/auth.js
const API_URL = 'http://localhost:3000/api'; // Reemplazá 


export async function loginCtrl(email, password) {
  console.log('Logging in with:', { email, password });
  return fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    credentials: 'include',
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

