/** @format */

import { useRef } from 'react';
import { forgotPassword } from '../api';

const ForgotPassword = () => {
  const emailRef = useRef<HTMLInputElement | null>(null);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const email = emailRef.current?.value;

    if (!email) throw new Error();

    const res = await forgotPassword(email);
    if (!res?.data.success) throw new Error(res?.data.message);

    emailRef.current!.value = '';
    window.alert('if email exist, link send on email');
  }

  return (
    <section>
      <div className='container'>
        <div className='flex flex-col justify-center items-center h-screen'>
          <h1 className='mb-5 text-3xl font-bold text-gray-900 text-center '>
            Forgotten password
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type='email'
              placeholder='Email'
              name='email'
              ref={emailRef}
              className='w-full mb-5 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />

            <button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer'
            >
              Reset password link send on email
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
export default ForgotPassword;
