/** @format */

import { Link } from 'react-router';

const Home = () => {
  return (
    <section>
      <div className='container'>
        <div className='flex flex-col justify-center items-center gap-3 h-screen'>
          <h1 className='text-3xl font-bold'>Welcome to Auth app</h1>
          <div className='flex gap-2'>
            <Link
              to='/register'
              className='w-40 text-center bg-blue-600 hover:bg-blue-700 text-white
                         font-semibold py-3 rounded-lg transition cursor-pointer'
            >
              Register
            </Link>
            <Link
              to='login'
              className='w-40 text-center bg-blue-600 hover:bg-blue-700 text-white
                         font-semibold py-3 rounded-lg transition cursor-pointer'
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Home;
