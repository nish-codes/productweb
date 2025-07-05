
import React from 'react'
import { Playfair_Display } from 'next/font/google';
import Link from "next/link";


const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
});
const Navbar = () => {
  return (
    <div className='h-[10vh]  flex items-center justify-between px-6  ' >
        <div className='flex items-center'><img className = 'h-[10vh] w-[auto]'src="/Assets/logo-new.png" alt="logo" />
        <h1 className={`${playfair.className} text-[#333333] text-3xl font-bold`}>Ssp Enterprise</h1>
        </div>
      <ul className='flex items-center space-x-8'>
        <li className='cursor-pointer hover:text-gray-600 transition-colors'>Home</li>
        <li className='cursor-pointer hover:text-gray-600 transition-colors'>Products</li>
        <li className='cursor-pointer hover:text-gray-600 transition-colors'>Contact us</li>
        <Link href="/login" className="text-[#DA8616] font-semibold">
  Admin Login
</Link>
      </ul>
    </div>
  )
}

export default Navbar