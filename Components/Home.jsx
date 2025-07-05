"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { Cinzel } from "next/font/google";
import "locomotive-scroll/dist/locomotive-scroll.css";
import { FaWhatsapp } from "react-icons/fa";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase/config"; // update the path if needed

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const data = [
  { icon: "🪔", title: "Diyas", desc: "Traditional lamps for your pooja" },
  { icon: "🧘‍♂️", title: "Incense", desc: "Fragrant sticks to uplift rituals" },
  { icon: "🙏", title: "Idols", desc: "Sacred idols of deities" },
  { icon: "🌺", title: "Samagri", desc: "All-in-one pooja essentials" },
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
  const [products, setProducts] = useState([]);
  const [scrollInstance, setScrollInstance] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!scrollRef.current) return;

    let scroll;
    import("locomotive-scroll").then((LocomotiveScroll) => {
      scroll = new LocomotiveScroll.default({
        el: scrollRef.current,
        smooth: true,
        multiplier: 1,
        lerp: 0.1,
        smartphone: {
          smooth: true,
        },
        tablet: {
          smooth: true,
        },
      });
      setScrollInstance(scroll);
    });

    return () => {
      if (scroll) scroll.destroy();
    };
  }, []);

  // Update Locomotive Scroll when products change
  useEffect(() => {
    if (scrollInstance) {
      setTimeout(() => {
        scrollInstance.update();
      }, 100);
    }
  }, [products, scrollInstance]);

  return (
    <div ref={scrollRef} data-scroll-container>
      {/* Hero Section */}
      <div data-scroll-section className="relative h-screen">
        <div
          className="absolute inset-0 bg-[url('/Assets/modelbg.jpg')] bg-cover bg-bottom"
          data-scroll
          data-scroll-speed="-3"
        ></div>

        <div className="absolute top-0 right-0 w-screen z-30 p-4">
          <Navbar />
        </div>

        <div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center"
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

      {/* Main Content Section */}
      <div data-scroll-section className="bg-[#FAF3E0] py-8 relative">
        <div className="fixed top-1/2 right-5 z-50">
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="text-green-500 text-5xl hover:scale-110 transition-transform duration-200" />
          </a>
        </div>

        <h2 className="text-center font-semibold text-3xl font-serif mb-[10vh]">Explore Our Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {data.map((elem, index) => (
            <div key={index} className="p-5 rounded-md shadow-lg text-center m-6 hover:scale-110 transition-all">
              <div className="text-5xl mb-4 font-thin">{elem.icon}</div>
              <h3 className="text-3xl mb-3 font-semibold">{elem.title}</h3>
              <p className="text-lg text-gray-500">{elem.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 px-4">
          <h3 className="text-center font-semibold text-2xl font-serif mb-12">Featured Products</h3>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.length === 0 ? (
              <p className="text-center col-span-3">No products found.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all">
                  <div className="h-40 bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
                    <img src={product.image} alt={product.title} className="h-full object-contain" />
                  </div>
                  <div className="p-5">
                    <h4 className="text-lg font-semibold mb-2">{product.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold text-[#DA8616]">₹{product.price}</span>
                      <button className="px-3 py-2 bg-[#DA8616] text-white text-sm rounded hover:bg-orange-600 transition-all">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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

        {/* Footer */}
        <footer className="bg-[#DA8616] text-black py-10 mt-20 min-h-[200px]">
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
