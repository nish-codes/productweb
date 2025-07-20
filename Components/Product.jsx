import React from 'react';

export default function ProductCard({ data }) {
  return (
    <div className="border border-[#ffe0b2] rounded-2xl p-5 shadow-lg bg-white hover:shadow-2xl hover:scale-105 transition-all duration-200">
      <img src={data.image} alt={data.title} className="w-full h-48 object-cover mb-4 rounded-xl shadow" />
      <h3 className="text-xl font-bold text-[#DA8616] mb-1">{data.title}</h3>
      <p className="text-gray-600 mb-2">{data.description}</p>
      <p className="text-orange-500 font-bold text-lg mt-2"> 9{data.price}</p>
    </div>
  );
}
