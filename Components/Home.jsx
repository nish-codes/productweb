"use client";

import React, { useEffect, useRef, useState } from "react";
import NavbarClient from "./NavbarClient";
import { Cinzel } from "next/font/google";
import "locomotive-scroll/dist/locomotive-scroll.css";
import { FaWhatsapp } from "react-icons/fa";
import Link from 'next/link';

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
const products = [
  {
    id: 1,
    title: "Premium Brass Diya Set",
    description: "Handcrafted brass diyas for auspicious occasions",
    price: "₹499",
    icon: "🪔",
    bgGradient: "from-orange-200 to-yellow-200",
  },
  {
    id: 2,
    title: "Sandalwood Incense",
    description: "Pure sandalwood fragrance for meditation",
    price: "₹299",
    icon: "🧘‍♂️",
    bgGradient: "from-purple-200 to-pink-200",
  },
  {
    id: 3,
    title: "Ganesha Marble Idol",
    description: "Beautiful handcrafted marble Ganesha",
    price: "₹1,299",
    icon: "🙏",
    bgGradient: "from-blue-200 to-indigo-200",
  },
];
const reasons = [
  {
    id: 1,
    icon: "🕉️",
    title: "Authentic Products",
    description: "Every item is carefully sourced and blessed to maintain its spiritual sanctity",
  },
  {
    id: 2,
    icon: "🚚",
    title: "Fast Delivery",
    description: "Your devotional needs delivered with care, ensuring perfect timing for rituals",
  },
  {
    id: 3,
    icon: "❤️",
    title: "Made with Love",
    description: "Each product is crafted with devotion and blessed for your spiritual well-being",
  },
];

const Home = () => {
  const scrollRef = useRef(null);
  const [navbarHidden, setNavbarHidden] = useState(false);
  const lastScrollY = useRef(0);
  const lastDirection = useRef(null);
  const threshold = 20; // px
  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!scrollRef.current) return;

    let scroll;
    import("locomotive-scroll/dist/locomotive-scroll").then((LocomotiveScroll) => {
      scroll = new LocomotiveScroll.default({
        el: scrollRef.current,
        smooth: true,
        multiplier: 1,
      });
      scroll.on("scroll", (obj) => {
        const currentScrollY = obj.scroll.y;
        const diff = currentScrollY - lastScrollY.current;
        // Debounce to prevent flicker
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = setTimeout(() => {
          if (diff > threshold) {
            // Scrolled down
            if (lastDirection.current !== 'down') {
              setNavbarHidden(true);
              lastDirection.current = 'down';
            }
          } else if (diff < -threshold) {
            // Scrolled up
            if (lastDirection.current !== 'up') {
              setNavbarHidden(false);
              lastDirection.current = 'up';
            }
          }
        }, 50);
        lastScrollY.current = currentScrollY;
      });
    });

    return () => {
      if (scroll) scroll.destroy();
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    };
  }, []);

  return (
    <div ref={scrollRef} data-scroll-container className="overflow-hidden">
      <NavbarClient hidden={navbarHidden} />
     
      <div data-scroll-section className="relative h-screen">
        <div
          className="absolute inset-0 bg-[url('/Assets/modelbg.jpg')] bg-cover bg-bottom"
          data-scroll
          data-scroll-speed="-3" 
        >
        
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
        className=" bg-[#FAF3E0]  min-h-screen py-8 relative"
      >
       

<div className="fixed top-1/2 right-5 z-50">
  <a
    href="https://wa.me/919876543210"
    target="_blank"
    rel="noopener noreferrer"
  >
    <FaWhatsapp className="text-green-500 text-5xl hover:scale-110 transition-transform duration-200" />
  </a>
</div>

      
        <h2 className="text-center font-semibold text-3xl font-serif mb-[10vh]  ">Explore Our Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 ">
          {data.map((elem,index)=>{
            return(
            <Link key={index} href={`/categories/${elem.title.toLowerCase()}`}
              className="p-5 rounded-md shadow-lg text-center m-6 hover:scale-110 transition-all block">
              <div className="text-5xl mb-4 font-thin">{elem.icon}</div>
              <h3 className="text-3xl mb-3 font-semibold">{elem.title}</h3>
              <p className="text-lg text-gray-500 ">{elem.desc}</p>
            </Link>
            )
          })}
          
        </div>
        
       <div className="mt-20 px-4">
  <h3 className="text-center font-semibold text-2xl font-serif mb-12">Featured Products</h3>
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
    {products.map((product) => (
      <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
        <div className={`h-40 bg-gradient-to-br ${product.bgGradient} flex items-center justify-center`}>
          <span className="text-5xl">{product.icon}</span>
        </div>
        <div className="p-5">
          <h4 className="text-lg font-semibold mb-2">{product.title}</h4>
          <p className="text-gray-600 text-sm mb-3">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-[#DA8616]">{product.price}</span>
            <button className="px-3 py-2 bg-[#DA8616] text-white text-sm rounded hover:bg-orange-600 transition-all">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>


       
  <div className="mt-20 px-4">
  <h3 className="text-center font-semibold text-2xl font-serif mb-12">Why Choose Us</h3>
  <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
    {reasons.map((reason) => (
      <div key={reason.id} className="text-center">
        <div className="w-16 h-16 bg-[#DA8616] rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl text-white">{reason.icon}</span>
        </div>
        <h4 className="text-xl font-semibold mb-3">{reason.title}</h4>
        <p className="text-gray-600">{reason.description}</p>
      </div>
    ))}
  </div>
</div>

<footer className="bg-[#DA8616] text-black py-10 mt-20">
  <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
    <div>
      <h4 className="text-xl font-bold mb-4">About Us</h4>
      <p className="text-sm text-black/80">
        We offer authentic and blessed pooja essentials to make your rituals more divine and meaningful.
      </p>
    </div>

    <div>
      <h4 className="text-xl font-bold mb-4">Quick Links</h4>
      <ul className="space-y-2 text-sm">
        <li><a href="#" className="hover:underline">Home</a></li>
        <li><a href="#" className="hover:underline">Products</a></li>
        <li><a href="#" className="hover:underline">Categories</a></li>
        <li><a href="#" className="hover:underline">Contact</a></li>
      </ul>
    </div>

    <div>
      <h4 className="text-xl font-bold mb-4">Customer Care</h4>
      <ul className="space-y-2 text-sm">
        <li><a href="#" className="hover:underline">FAQs</a></li>
        <li><a href="#" className="hover:underline">Shipping</a></li>
        <li><a href="#" className="hover:underline">Returns</a></li>
        <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
      </ul>
    </div>

    <div>
      <h4 className="text-xl font-bold mb-4">Contact Us</h4>
      <p className="text-sm text-black/80">📞 +91 9876543210</p>
      <p className="text-sm text-black/80">📧 support@divinestore.in</p>
      <p className="text-sm text-black/80 mt-2">📍 Karur, Tamil Nadu</p>
    </div>
  </div>

  <div className="text-center text-sm text-black/70 mt-10 border-t border-black/20 pt-4">
    &copy; {new Date().getFullYear()} DivineStore. All rights reserved.
  </div>
</footer>


        
      </div>
    </div>
  );
};

export default Home;
