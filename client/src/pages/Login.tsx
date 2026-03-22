/** @format */

import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { userLogin } from '../api';

const Login = () => {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // const [formData, setFormData] = useState({ email: '', password: '' });
  // function handleChange(e: React.ChangeEvent<HTMLFormElement>) {
  //   const { name, value } = e.target;
  //   setFormData({
  //     ...formData,
  //     [name]: value,
  //   });
  // }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;

    if (!email || !password) throw new Error();

    const res = await userLogin({ email, password });
    if (!res?.data.success) throw new Error(res.data.message);

    navigate('/about');
  }

  return (
    <section className='pt-5'>
      <div className='container'>
        <div className='flex flex-col justify-center items-center h-screen'>
          <h1 className='mb-3 text-3xl font-bold text-gray-900 text-center '>
            Log in to continue
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type='email'
              placeholder='Email'
              name='email'
              className='w-full mb-5 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
              ref={emailRef}
              required
            />

            <input
              type='password'
              placeholder='Password'
              name='password'
              className='w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
              ref={passwordRef}
              required
            />

            <button
              type='submit'
              className='w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer'
            >
              Continue
            </button>

            <div className='text-sm text-gray-500 text-center my-4'>
              Other log in options
            </div>

            <div className='flex justify-center gap-4 mb-6'>
              <button className='w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50 cursor-pointer'>
                <img src={'google'} alt='Google' className='w-5' />
              </button>
              <button className='w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50'>
                <img
                  src={'facebook'}
                  alt='Facebook'
                  className='w-5 cursor-pointer'
                />
              </button>
              <button className='w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50'>
                <img src={'apple'} alt='Apple' className='w-5 cursor-pointer' />
              </button>
            </div>

            <div className='bg-gray-50 rounded-lg py-4 text-center text-sm'>
              Don&apos;t have an account?{' '}
              <Link
                to='/register'
                className='text-blue-600 font-semibold cursor-pointer'
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
export default Login;
