/** @format */

import { Link, useNavigate } from 'react-router';
import { userLogout } from '../api';
import { useAuth } from '../context/AuthContext';

const About = () => {
  const navigate = useNavigate();

  const { user, setUser } = useAuth();

  // const user: { name: string; email: string; role: 'USER' | 'ADMIN' } = {
  //   name: 'Yogesh Dhuri',
  //   email: 'ysdhuri312@gmail.com',
  //   role: 'USER',
  // };

  async function handleLogout() {
    const res = await userLogout();
    if (!res?.data.success) throw new Error(res?.data.message);
    setUser(null);
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
            <Link
              to='/dashboard'
              className='bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-sm transition cursor-pointer'
            >
              Dashbord
            </Link>
          ) : null}
          <button
            onClick={handleLogout}
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
