/** @format */

import { useNavigate } from 'react-router';
import { userLogout } from '../api';

const About = () => {
  const navigate = useNavigate();

  const user: { name: string; email: string; role: 'USER' | 'ADMIN' } = {
    name: 'Yogesh Dhuri',
    email: 'ysdhuri312@gmail.com',
    role: 'USER',
  };

  // const user = false;

  async function handleSubmit() {
    const res = await userLogout();
    if (!res?.data.success) throw new Error(res?.data.message);

    navigate('/');
  }

  return (
    <div className='pt-15'>
      <div className='container '>
        <div className='min-h-[calc(100vh-60px)] flex flex-col justify-center items-center gap-2'>
          <p>
            User Login with {user && user.role === 'ADMIN' ? 'Admin' : 'Normal'}{' '}
            Role
          </p>
          {user && user.role === 'ADMIN' ? (
            <button className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-sm transition cursor-pointer'>
              Dashbord
            </button>
          ) : null}
          <button
            onClick={handleSubmit}
            className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-sm transition cursor-pointer'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
export default About;
