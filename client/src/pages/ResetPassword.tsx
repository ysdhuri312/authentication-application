/** @format */

import { useRef } from 'react';
import { resetPassword } from '../api';
import { useSearchParams } from 'react-router';

const ResetPassword = () => {
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const [params] = useSearchParams();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    const password = passwordRef.current?.value;
    if (!password) throw new Error();

    const token = params.get('t');
    if (!token || typeof token !== 'string')
      throw new Error('Invalid or missing token');

    const res = await resetPassword(password, token);
    console.log(token);
    if (!res?.data.success) throw new Error(res?.data.message);

    passwordRef.current!.value = '';
    window.alert('Password reset succesfully');
  }

  return (
    <section>
      <div className='container'>
        <div className='flex flex-col justify-center items-center h-screen'>
          <h1 className='mb-5 text-3xl font-bold text-gray-900 text-center '>
            Reset Password
          </h1>
          <form onSubmit={handleSubmit}>
            <input
              type='password'
              placeholder='Enter new password'
              name='password'
              ref={passwordRef}
              className='w-full mb-5 border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600'
              required
            />

            <button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition cursor-pointer'
            >
              Reset password
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};
export default ResetPassword;
