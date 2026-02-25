

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_URL = `${BASE_URL}/api`;

export async function loginCtrl(email, password) {
  return fetch(`${API_URL}/usuarios`, { 
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
    ? `${API_URL}/cuidador`
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
  return fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    credentials: 'include',
  });
}