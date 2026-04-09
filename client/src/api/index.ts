/** @format */

import type { AxiosError } from 'axios';
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

export function userRegisterWithGoogle() {
  try {
    const res = axios.get('auth/google');
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

export async function userLogout() {
  const res = axios.get('auth/logout');
  return res.catch((err: AxiosError) => {
    if (err.response) return err.response;
    const message = 'Somthing went wrong';
    console.log('Error :', message);
  });
}

export async function forgotPassword(email: string) {
  const res = axios.post('auth/forgot-password', { email });
  return res.catch((err: AxiosError) => {
    if (err.response) return err.response;
    const message = 'Somthing went wrong';
    console.log('Error :', message);
  });
}

export async function resetPassword(password: string, token: string) {
  const res = axios.post(
    'auth/reset-password',
    { password },
    { params: { t: token } },
  );
  return res.catch((err: AxiosError) => {
    if (err.response) return err.response;
    const message = 'Somthing went wrong';
    console.log('Error :', message);
  });
}
