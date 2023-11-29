import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://fitness-coaching.azurewebsites.net/', // Your API base URL
});

const axiosInstance2 = axios.create({
  baseURL: 'https://dietplans.azurewebsites.net/', // External API base URL
});

const token = localStorage.getItem('token');
if (token) {
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

const token2 = localStorage.getItem('token2');
if (token2) {
  axiosInstance2.defaults.headers.common['Authorization'] = `Bearer ${token2}`;
}

export default { axiosInstance, axiosInstance2 };

