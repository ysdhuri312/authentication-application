/** @format */

import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { userLogout } from '../api';

const Header = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    const res = await userLogout();
    if (!res?.data.success) throw new Error(res?.data.message);
    setUser(null);
    navigate('/');
  }

  return (
    <section className='w-full fixed border-b border-[rgba(0,0,0,0.1)] backdrop-blur-sm'>
      <div className='container'>
        <div className='h-15 flex justify-between items-center'>
          <p className='font-medium text-xl'>LOGO.</p>
          {user && <button onClick={handleLogout}>Logout</button>}
          {user && user.role === 'ADMIN' ? (
            <Link to='dashboard'>Dashbord</Link>
          ) : null}
        </div>
      </div>
    </section>
  );
};
export default Header;
