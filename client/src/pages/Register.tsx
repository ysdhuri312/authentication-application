/** @format */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { userRegister } from '../api';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log(formData);

    const res = await userRegister(formData);
    if (!res?.data.success) throw new Error(res.data.message);

    navigate('/about');
  }

  return (
    <section className='pt-20'>
      <div className='container'>
        <div className='flex flex-col justify-center items-center'>
          <h1 className='text-3xl font-bold text-gray-900 text-center'>
            Register for continue
          </h1>
          <form
            onSubmit={handleSubmit}
            className='flex flex-col justify-center w-full max-w-md mx-auto px-6 mt-8'
          >
            {/* Full Name */}
            <input
              type='text'
              placeholder='Full name'
              className='w-full mb-5 border border-gray-300 rounded-lg px-4 py-3 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-600'
              name='fullname'
              value={formData.fullname}
              onChange={handleChange}
              required
            />

            <input
              type='email'
              placeholder='Email'
              className='w-full mb-5 border border-gray-300 rounded-lg px-4 py-3 text-sm
                   focus:outline-none focus:ring-2 focus:ring-blue-600'
              name='email'
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type='password'
              placeholder='Password'
              className='w-full mb-5 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
              name='password'
              value={formData.password}
              onChange={handleChange}
              required
            />

            <label className='flex items-start gap-3 text-sm text-gray-600 mb-6'>
              <input
                type='checkbox'
                defaultChecked
                className='mt-1 accent-blue-600'
              />
              <span>
                Send me special offers, personalized recommendations, and
                learning tips.
              </span>
            </label>

            <button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white
                         font-semibold py-3 rounded-lg transition cursor-pointer'
            >
              Continue
            </button>

            <div className='text-sm text-gray-500 text-center my-6'>
              Other sign up options
            </div>

            <div className='flex justify-center gap-4 mb-6'>
              <button className='w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50'>
                <img src={'google'} alt='Google' className='w-5' />
              </button>
              <button className='w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50'>
                <img src={'facebook'} alt='Facebook' className='w-5' />
              </button>
              <button className='w-12 h-12 border rounded-lg flex items-center justify-center hover:bg-gray-50'>
                <img src={'apple'} alt='Apple' className='w-5' />
              </button>
            </div>

            <p className='text-center text-sm text-gray-500 mb-6'>
              By signing up, you agree to our{' '}
              <a href='#' className='text-blue-600 font-medium'>
                Terms of Use
              </a>{' '}
              and{' '}
              <a href='#' className='text-blue-600 font-medium'>
                Privacy Policy
              </a>
              .
            </p>

            <div className='bg-gray-50 rounded-lg py-4 text-center text-sm'>
              Already have an account?{' '}
              <Link to='/login' className='text-blue-600 font-semibold'>
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};
export default Register;
