"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, categoriesCollection } from "../../firebase/config";
import { useSearchParams } from "next/navigation";
import Navbar from '../../Components/Navbar';

export default function ProductPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");

  const searchParams = useSearchParams();

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(items);
      setFiltered(items);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(categoriesCollection, (snapshot) => {
      const cats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (selectedCategory === "All") {
      setSubcategories([]);
      setSelectedSubcategory("");
      setFiltered(products);
      return;
    }
    const cat = categories.find((c) => c.name === selectedCategory);
    setSubcategories(cat ? cat.subcategories || [] : []);
    setSelectedSubcategory("");
    setFiltered(products.filter((p) => p.category === selectedCategory));
  }, [selectedCategory, categories, products]);

  useEffect(() => {
    if (selectedSubcategory) {
      setFiltered(products.filter((p) => p.category === selectedCategory && p.subcategory === selectedSubcategory));
    } else if (selectedCategory !== "All") {
      setFiltered(products.filter((p) => p.category === selectedCategory));
    } else {
      setFiltered(products);
    }
  }, [selectedSubcategory, selectedCategory, products]);

  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam && categories.some((c) => c.name === catParam)) {
      setSelectedCategory(catParam);
    }
  }, [categories, searchParams]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFiltered(products);
    } else {
      setFiltered(products.filter((p) => p.category === category));
    }
  };

  return (
    <>
      <Navbar className="products-navbar" />
      <div className="p-6 max-w-7xl mx-auto min-h-screen" style={{ background: 'linear-gradient(135deg, #fff7e6 0%, #ffe0b2 100%)' }}>
        <h1 className="text-3xl font-bold text-center mb-6">Our Products</h1>

        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <button
            key="All"
            onClick={() => setSelectedCategory("All")}
            className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedCategory === "All" ? "bg-orange-500 text-white border-orange-600" : "bg-white text-gray-700 border-gray-300"} hover:bg-orange-100`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium border ${selectedCategory === cat.name ? "bg-orange-500 text-white border-orange-600" : "bg-white text-gray-700 border-gray-300"} hover:bg-orange-100`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {selectedCategory !== "All" && subcategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {subcategories.map((sub, i) => (
              <button
                key={i}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedSubcategory === sub ? "bg-orange-400 text-white border-orange-500" : "bg-white text-gray-700 border-gray-300"} hover:bg-orange-100`}
              >
                {sub}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 py-8">
          {filtered.length === 0 ? (
            <p className="col-span-3 text-center text-gray-600">No products found.</p>
          ) : (
            filtered.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-xl border border-[#ffe0b2] p-6 flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
              >
                <div className="w-56 h-56 bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center rounded-xl mb-6 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h2 className="font-extrabold text-2xl text-[#b86c0e] mb-2 text-center">{product.title}</h2>
                <p className="text-gray-600 text-base mb-4 text-center">{product.description}</p>
                <div className="flex justify-between items-center w-full mt-auto">
                  <span className="text-2xl font-bold text-[#DA8616]">₹{product.price}</span>
                  <span className="text-xs px-3 py-1 bg-[#FFF7E6] text-[#b86c0e] rounded-full border border-[#ffe0b2] ml-2 font-semibold uppercase">{product.category}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
