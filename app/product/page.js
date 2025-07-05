"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import ProductCard from "../../components/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const productList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(productList);
    };

    fetchProducts();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Our Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map(product => (
          <ProductCard key={product.id} data={product} />
        ))}
      </div>
    </div>
  );
}