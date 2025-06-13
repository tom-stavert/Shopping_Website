import axios from 'axios';

// Create an isntance of axios with base URL
const api = axios.create({
    baseURL: "http://localhost:8000"
});

// Export the Axios instance
export default api;
