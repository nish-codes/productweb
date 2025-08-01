"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/config";
import { useSearchParams } from "next/navigation";
import Navbar from '../../Components/Navbar';
import { FaSpinner } from "react-icons/fa";

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
      setFiltered(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff7e6 0%, #ffe0b2 50%, #ffcc80 100%)' }}>
        <div className="p-6 max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-fade-in-up">
            <h1 className="text-5xl font-bold text-[#b86c0e] mb-4 drop-shadow-lg">
              Our Products
            </h1>
            <p className="text-lg text-[#b86c0e]/80 max-w-2xl mx-auto">
              Discover our carefully curated collection of divine pooja essentials, 
              each item blessed and selected with devotion for your spiritual journey.
            </p>
          </div>

          <div className="text-center mb-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <p className="text-[#b86c0e]/70 font-medium">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="relative">
                  <FaSpinner className="animate-spin text-4xl text-[#DA8616] mx-auto mb-4" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
                <p className="text-[#b86c0e] font-medium mt-4">Loading products...</p>
                <div className="mt-2 text-sm text-[#b86c0e]/60">Please wait while we fetch your divine offerings</div>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 animate-fade-in-up">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-[#b86c0e] mb-2">No products found</h3>
              <p className="text-[#b86c0e]/70 mb-4">No products available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filtered.map((product, index) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-xl border border-[#ffe0b2] overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-2xl group product-card animate-fade-in-up"
                  style={{ 
                    animationDelay: `${Math.min(index * 50, 1000)}ms`,
                    opacity: 0,
                    animation: `fadeInUp 0.6s ease-out ${Math.min(index * 50, 1000)}ms forwards`
                  }}
                >
                  <div className="relative h-64 bg-gradient-to-br from-orange-100 to-yellow-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    {product.bestSeller && (
                      <div className="absolute top-4 left-4 bg-[#DA8616] text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Best Seller
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs px-3 py-1 bg-[#FFF7E6] text-[#b86c0e] rounded-full border border-[#ffe0b2] font-semibold uppercase">
                        {product.category}
                      </span>
                      {product.subcategory && (
                        <span className="text-xs px-2 py-1 bg-[#ffe0b2] text-[#b86c0e] rounded-full font-medium">
                          {product.subcategory}
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-bold text-xl text-[#b86c0e] mb-2 line-clamp-2 group-hover:text-[#DA8616] transition-colors">
                      {product.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-[#DA8616]">
                        ₹{product.price?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
