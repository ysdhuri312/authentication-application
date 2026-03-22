/** @format */

import axios from '../services/aptiClient';

export function userRegister(data: {
  fullname: string;
  email: string;
  password: string;
}) {
  try {
    const res = axios.post('auth/register', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.catch((err: any) => {
      if (err.response) {
        return err.response;
      }
    });
  } catch (error: any) {
    const message = error.reponse?.data?.message || 'Somthing went wrong';
    console.log('Error :', message);
  }
}

export function userLogin(data: { email: string; password: string }) {
  try {
    const res = axios.post('auth/login', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.catch((err: any) => {
      if (err.response) {
        return err.response;
      }
    });
  } catch (error: any) {
    const message = error.reponse?.data?.message || 'Somthing went wrong';
    console.log('Error :', message);
  }
}
