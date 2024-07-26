import axios from 'axios';

axios.defaults.withCredentials = true;

export const checkUserSession = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:5000/check_session');
    return response.data;
  } catch (error) {
    console.error('Session check failed', error);
    return null;
  }
};
