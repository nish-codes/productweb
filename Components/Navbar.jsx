"use client";
import React, { useState } from "react";
import { Playfair_Display } from "next/font/google";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const Navbar = ({ isHome, hidden, className = "" }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const isProducts = className.includes("products-navbar");

  const navClass = [
    isHome
      ? "absolute top-0 right-0 w-screen z-30 px-4 sm:px-6 md:px-8 h-[10vh] flex items-center justify-between"
      : isProducts
      ? "h-[10vh] flex items-center justify-between px-6 bg-white shadow-2xl border-b border-[#ffe0b2]"
      : "h-[10vh] flex items-center justify-between px-6 shadow-2xl",
    "transition-transform duration-300",
    hidden ? "-translate-y-full" : "translate-y-0",
    isProducts ? "" : "bg-white/10 backdrop-blur-md rounded-2xl border border-white/20",
    className,
  ].join(" ");

  return (
    <div className={`${navClass} relative`}>
      {/* Left Logo + Title */}
      <div className="flex items-center space-x-3">
        <Link href="/">
          <img
            className="h-[7vh] w-auto cursor-pointer"
            src="/Assets/logo-new.png"
            alt="logo"
          />
        </Link>
        <h1
          className={`${playfair.className} ${
            isProducts ? "text-[#b86c0e]" : "text-[#b86c0e]"
          } text-xl sm:text-2xl font-bold`}
        >
          Ssp Enterprise
        </h1>
      </div>

      {/* Hamburger (only on mobile) */}
      <div className="md:hidden">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-[#b86c0e] focus:outline-none"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Menu */}
      <ul
        className={`absolute top-[10vh] right-0 md:static md:flex md:space-x-8 items-center bg-white md:bg-transparent shadow-md md:shadow-none w-full md:w-auto px-6 py-6 md:p-0 space-y-4 md:space-y-0 z-40 transition-all duration-300 ${
          menuOpen ? "flex flex-col" : "hidden md:flex"
        }`}
      >
        <li
          className={`cursor-pointer ${
            isProducts ? "text-[#b86c0e]" : "text-[#b86c0e] md:text-white"
          } hover:text-[#252627] transition-colors`}
        >
          Home
        </li>
        <Link
          href="/product"
          className={`cursor-pointer ${
            isProducts ? "text-[#b86c0e]" : "text-[#b86c0e] md:text-white"
          } hover:text-[#252627] transition-colors`}
        >
          Products
        </Link>
        <li
          className={`cursor-pointer ${
            isProducts ? "text-[#b86c0e]" : "text-[#b86c0e] md:text-white"
          } hover:text-[#252627] transition-colors`}
        >
          Contact us
        </li>
        <Link
          href="/login"
          className={`bg-white ${
            isProducts ? "text-[#DA8616]" : "text-[#EAAC8B]"
          } font-semibold px-4 py-2 rounded shadow hover:bg-[#252627] hover:text-white transition-colors`}
        >
          Admin Login
        </Link>
      </ul>
    </div>
  );
};

export default Navbar;
