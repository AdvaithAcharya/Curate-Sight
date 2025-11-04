import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;
const baseURL = API_BASE ? `${API_BASE}/api` : '/api';

export const api = axios.create({
  baseURL,
});

export const getSessionId = () => {
  let id = localStorage.getItem('curatesight_session');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    localStorage.setItem('curatesight_session', id);
  }
  return id;
};
