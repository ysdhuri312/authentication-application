/** @format */

const Home = () => {
  return (
    <section>
      <div className='container'>
        <div className='flex flex-col justify-center items-center gap-3 h-screen'>
          <h1 className='text-3xl font-bold'>Welcome to Auth app</h1>
          <div className='flex gap-2'>
            <button
              className=' bg-blue-600 hover:bg-blue-700 text-white
                         font-semibold px-10 py-3 rounded-lg transition cursor-pointer'
            >
              Register
            </button>
            <button
              className=' bg-blue-600 hover:bg-blue-700 text-white
                         font-semibold px-10 py-3 rounded-lg transition cursor-pointer'
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Home;
