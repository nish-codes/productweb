import React from 'react'
import Navbar from './Navbar'

import { Cinzel, Cormorant_Garamond } from 'next/font/google';

const cinzel = Cinzel({
 subsets: ['latin'],
  weight: ['400', '700'],

})

const Home = () => {
  return (
    <div className="w-screen h-screen bg-[url('/Assets/modelbg.jpg')]  bg-cover bg-no-repeat bg-bottom" >
    <Navbar/>
    <div className='h-[90vh] flex justify-center items-center flex-col'>
      <h1 className={` ${cinzel.className} text-4xl font-semibold text-gray-600`}>Divine Offerings for Every Ritual</h1>
      <p className='text-gray-500'>Explore handpicked pooja essentials delivered with care and devotion.</p>
     
    </div>
    </div>
  )
}

export default Home