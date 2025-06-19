"use client";

import React, { useEffect, useRef } from "react";
import Navbar from "./Navbar";
import { Cinzel } from "next/font/google";
import "locomotive-scroll/dist/locomotive-scroll.css";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
});
const data = [
      { icon: "🪔", title: "Diyas", desc: "Traditional lamps for your pooja" },
      { icon: "🧘‍♂️", title: "Incense", desc: "Fragrant sticks to uplift rituals" },
      { icon: "🙏", title: "Idols", desc: "Sacred idols of deities" },
      { icon: "🌺", title: "Samagri", desc: "All-in-one pooja essentials" },
    ]
const Home = () => {
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    let scroll;
    import("locomotive-scroll/dist/locomotive-scroll").then((LocomotiveScroll) => {
      scroll = new LocomotiveScroll.default({
        el: scrollRef.current,
        smooth: true,
        multiplier: 1,
      });
    });

    return () => {
      if (scroll) scroll.destroy();
    };
  }, []);

  return (
    <div ref={scrollRef} data-scroll-container className="overflow-hidden">
     
      <div data-scroll-section className="relative h-screen">
        <div
          className="absolute inset-0 bg-[url('/Assets/modelbg.jpg')] bg-cover bg-bottom"
          data-scroll
          data-scroll-speed="-3" 
        >
        
        </div>
        
       <div className="absolute top-0 right-0 w-screen z-30 p-4">
     <Navbar />
      </div>

        <div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center "
          data-scroll
          data-scroll-speed="2"
        >
          
          <h1 className={`${cinzel.className} text-5xl text-gray-600 font-bold mb-4`}>
            Divine Offerings for Every Ritual
          </h1>
          <p className="text-lg mb-6 text-gray-500">
            Explore handpicked pooja essentials delivered with care and devotion.
          </p>
          <button className="px-6 py-3 bg-[#DA8616] text-black rounded-md hover:text-white hover:bg-gray-700 hover:scale-110 transition-all">
            Explore Now
          </button>
        </div>
      </div>

      
      <div
        data-scroll-section  
        className=" bg-[#FAF3E0]  min-h-screen py-8"
      >
        <h2 className="text-center font-semibold text-3xl font-serif mb-[10vh]  ">Explore Our Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 ">
          {data.map((elem,index)=>{
            return(
            <div className="p-5 rounded-md shadow-lg text-center m-6 hover:scale-110 transition-all">
              <div className="text-5xl mb-4 font-thin">{elem.icon}</div>
              <h3 className="text-3xl mb-3 font-semibold">{elem.title}</h3>
              <p className="text-lg text-gray-500 ">{elem.desc}</p>
            </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
