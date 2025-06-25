import React from 'react';

const allProducts = [
  {
    id: 1,
    title: "Premium Brass Diya Set",
    description: "Handcrafted brass diyas for auspicious occasions",
    price: "₹499",
    icon: "🪔",
    bgGradient: "from-orange-200 to-yellow-200",
    category: "diyas",
  },
  {
    id: 2,
    title: "Sandalwood Incense",
    description: "Pure sandalwood fragrance for meditation",
    price: "₹299",
    icon: "🧘‍♂️",
    bgGradient: "from-purple-200 to-pink-200",
    category: "incense",
  },
  {
    id: 3,
    title: "Ganesha Marble Idol",
    description: "Beautiful handcrafted marble Ganesha",
    price: "₹1,299",
    icon: "🙏",
    bgGradient: "from-blue-200 to-indigo-200",
    category: "idols",
  },
  {
    id: 4,
    title: "Pooja Samagri Kit",
    description: "All-in-one essentials for your rituals",
    price: "₹799",
    icon: "🌺",
    bgGradient: "from-pink-200 to-yellow-100",
    category: "samagri",
  },
  // Add more products as needed
];

export default function CategoryPage({ params }) {
  const { category } = params;
  const filteredProducts = allProducts.filter(
    (p) => p.category === category.toLowerCase()
  );

  return (
    <div className="min-h-screen flex flex-col items-center py-12 bg-[#FAF3E0]">
      <h1 className="text-4xl font-bold mb-8 capitalize">{category} Products</h1>
      {filteredProducts.length === 0 ? (
        <p className="text-lg text-gray-600">No products found for this category.</p>
      ) : (
        <div className="max-w-6xl w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
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
      )}
    </div>
  );
} 