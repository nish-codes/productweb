"use client";

import React, { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import { Cinzel } from "next/font/google";
import "locomotive-scroll/dist/locomotive-scroll.css";
import { FaWhatsapp } from "react-icons/fa";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, categoriesCollection } from "../firebase/config"; // update the path if needed
import Link from "next/link";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const defaultIcons = ["🪔", "🧘‍♂️", "🙏", "🌺", "🕉️", "🚚", "❤️", "🌸", "🛕", "🧿", "🪔"];
const defaultDescs = [
  "Traditional lamps for your pooja",
  "Fragrant sticks to uplift rituals",
  "Sacred idols of deities",
  "All-in-one pooja essentials",
  "Blessed items for your rituals",
  "Spiritual accessories",
  "Handpicked for devotion",
  "Divine gifts",
  "Pure and authentic",
  "Special pooja items"
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
  const [categories, setCategories] = useState([]);

 useEffect(() => {
  const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const items = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item) => item.bestSeller === true);
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
  }, [products, categories, scrollInstance]);

  useEffect(() => {
    const unsub = onSnapshot(categoriesCollection, (snapshot) => {
      const cats = snapshot.docs.map((doc, i) => ({
        id: doc.id,
        ...doc.data(),
        icon: doc.data().icon || defaultIcons[i % defaultIcons.length],
        desc: doc.data().desc || defaultDescs[i % defaultDescs.length],
      }));
      setCategories(cats);
    });
    return () => unsub();
  }, []);

  return (
    <div ref={scrollRef} data-scroll-container>
      {/* Hero Section */}
      <div data-scroll-section className="relative h-screen">
        <div
          className="absolute inset-0 bg-[url('/Assets/modelbg.jpg')] bg-cover bg-bottom"
          data-scroll
          data-scroll-speed="-3"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#fff7e6]/80 to-[#ffe0b2]/60 z-10" />
        </div>

        <div className="absolute top-0 right-0 w-screen z-30 p-4">
          <Navbar />
        </div>

        <div
          className="relative z-20 flex flex-col items-center justify-center h-full text-center"
          data-scroll
          data-scroll-speed="2"
        >
          <h1 className={`${cinzel.className} text-6xl text-[#b86c0e] drop-shadow-lg font-extrabold mb-4`}>Divine Offerings for Every Ritual</h1>
          <p className="text-xl mb-8 text-[#b86c0e]/90 font-medium drop-shadow">Explore handpicked pooja essentials delivered with care and devotion.</p>
          <button className="btn hover:scale-110">Explore Now</button>
        </div>
      </div>

      {/* Main Content Section */}
      <div data-scroll-section className="bg-[#FAF3E0] py-8 relative">
        <div className="fixed top-1/2 right-5 z-50">
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
            <FaWhatsapp className="text-green-500 text-5xl hover:scale-110 transition-transform duration-200" />
          </a>
        </div>

        <h2 className="text-center font-semibold text-4xl font-serif mb-[10vh] text-[#DA8616] drop-shadow">Explore Our Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
          {categories
            .filter(cat => cat.name && cat.name.trim() !== '' && products.some(p => p.category === cat.name))
            .map((cat, index) => (
              <Link key={cat.id} href={`/product?category=${encodeURIComponent(cat.name)}`}>
                <div className="w-[320px] h-[140px] flex flex-col items-center justify-center p-6 rounded-xl shadow-xl border border-[#4C8577] bg-[#EEFFDB] relative transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-[#618B4A] group">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#4C8577] shadow-lg mb-2 border-2 border-[#618B4A] group-hover:scale-110 transition-transform">
                    <span className="text-3xl text-white">{cat.icon}</span>
                  </div>
                  <h3 className="text-lg font-extrabold text-[#EAAC8B] tracking-widest uppercase font-serif group-hover:text-[#252627] transition-colors mt-1">{cat.name}</h3>
                </div>
              </Link>
            ))}
        </div>

        <div className="mt-20 px-4">
          <h3 className="text-center font-semibold text-3xl font-serif mb-12 text-[#DA8616]">Featured Products</h3>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.length === 0 ? (
              <p className="text-center col-span-3">No products found.</p>
            ) : (
              products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:scale-105 transition-all border border-[#ffe0b2]">
                  <div className="h-44 bg-gradient-to-br from-orange-200 to-yellow-200 flex items-center justify-center">
                    <img src={product.image} alt={product.title} className="h-full object-contain" />
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold mb-2 text-[#DA8616]">{product.title}</h4>
                    <p className="text-gray-600 text-base mb-3">{product.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-[#DA8616]">₹{product.price}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-20 px-4">
          <h3 className="text-center font-semibold text-2xl font-serif mb-12 text-[#DA8616]">Why Choose Us</h3>
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {reasons.map((reason) => (
              <div key={reason.id} className="text-center">
                <div className="w-16 h-16 bg-[#DA8616] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl text-white">{reason.icon}</span>
                </div>
                <h4 className="text-xl font-semibold mb-3 text-[#DA8616]">{reason.title}</h4>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-gradient-to-r from-[#DA8616] to-[#ffb347] text-black py-12 mt-20 min-h-[200px] shadow-inner rounded-t-2xl">
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xl font-bold mb-4">About Us</h4>
              <p className="text-sm text-black/80">We offer authentic and blessed pooja essentials to make your rituals more divine and meaningful.</p>
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
              <p className="text-sm text-black/80">  +91 9876543210</p>
              <p className="text-sm text-black/80">  support@divinestore.in</p>
              <p className="text-sm text-black/80 mt-2">  Karur, Tamil Nadu</p>
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