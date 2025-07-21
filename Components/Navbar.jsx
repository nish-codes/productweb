import React from 'react'
import { Playfair_Display } from 'next/font/google';
import Link from "next/link";

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
});

const Navbar = ({ isHome, hidden }) => {
  const navClass = [
    isHome
      ? 'absolute top-0 right-0 w-screen z-30 p-4 h-[10vh] flex items-center justify-between px-6'
      : 'h-[10vh] flex items-center justify-between px-6 shadow',
    'transition-transform duration-300',
    hidden ? '-translate-y-full' : 'translate-y-0',
    'bg-white/10 backdrop-blur-md shadow-md rounded-2xl border border-white/20'
  ].join(' ');

  return (
    <div className={navClass}>
      <div className='flex items-center'>
        <img className='h-[10vh] w-auto' src="/Assets/logo-new.png" alt="logo" />
        <h1 className={`${playfair.className} text-white text-3xl font-bold ml-2`}>Ssp Enterprise</h1>
      </div>
      <ul className='flex items-center space-x-8'>
        <li className='cursor-pointer text-white hover:text-[#252627] transition-colors'>Home</li>
        <Link href="/product" className='cursor-pointer text-white hover:text-[#252627] transition-colors'>Products</Link>
        <li className='cursor-pointer text-white hover:text-[#252627] transition-colors'>Contact us</li>
        <Link
          href="/login"
          className="bg-white text-[#EAAC8B] font-semibold px-4 py-2 rounded shadow hover:bg-[#252627] hover:text-white transition-colors"
        >
          Admin Login
        </Link>
      </ul>
    </div>
  );
};

export default Navbar;
