import { io } from 'socket.io-client';

// In production behind Nginx reverse proxy, connect to current host origin.
// In local dev without Nginx proxy, connect directly to localhost:5000.
const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost' && window.location.port === '3000' ? 'http://localhost:5000' : '/');

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000
});
