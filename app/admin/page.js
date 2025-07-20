'use client';

import { useEffect, useState } from 'react';
import { db, categoriesCollection, productsCollection } from '../../firebase/config';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { uploadToCloudinary } from '../../utils/cloudinary';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('view');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [image, setImage] = useState('');
  const [existingImage, setExistingImage] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [bestSeller, setBestSeller] = useState(false);

  // Fetch products
  useEffect(() => {
    const unsub = onSnapshot(productsCollection, (snap) => {
      setProducts(snap.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsub();
  }, []);

  // Fetch categories
  useEffect(() => {
    const unsub = onSnapshot(categoriesCollection, (snap) => {
      const cats = snap.docs.map((doc) => doc.data().name);
      setCategories(cats);
    });
    return () => unsub();
  }, []);

  // Fetch all subcategories
  useEffect(() => {
    const unsub = onSnapshot(categoriesCollection, (snap) => {
      let allSubs = [];
      snap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.subcategories) {
          allSubs = [...allSubs, ...data.subcategories];
        }
      });
      setSubcategories([...new Set(allSubs)]);
    });
    return () => unsub();
  }, []);

  const handleAddOrUpdateProduct = async () => {
    if (!title || !price || !category || !subcategory) return alert('All fields required');

    let imgURL = existingImage;
    if (image) {
      imgURL = await uploadToCloudinary(image);
    }

    // Auto-increment customId
    const q = query(productsCollection, orderBy('customId', 'desc'));
    const snap = await getDocs(q);
    let newId = 1;
    if (!snap.empty) {
      newId = snap.docs[0].data().customId + 1;
    }

    // Add category if doesn't exist
    const catSnap = await getDocs(categoriesCollection);
    const catDocs = catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    if (!categories.includes(category)) {
      await addDoc(categoriesCollection, {
        name: category,
        subcategories: [subcategory],
        createdAt: serverTimestamp(),
      });
    } else {
      // Add subcategory if missing
      const catDoc = catDocs.find((doc) => doc.name === category);
      if (catDoc) {
        const catRef = doc(db, 'categories', catDoc.id);
        const existingSubs = catDoc.subcategories || [];
        if (!existingSubs.includes(subcategory)) {
          await updateDoc(catRef, {
            subcategories: [...existingSubs, subcategory],
          });
        }
      }
    }

    let productData = {
      title,
      price: parseFloat(price),
      category,
      subcategory,
      image: imgURL,
      createdAt: serverTimestamp(),
      bestSeller,
    };

    if (editingId) {
      const productRef = doc(db, 'products', editingId);
      await updateDoc(productRef, productData);
      alert('Product updated');
    } else {
      productData.customId = newId;
      await addDoc(productsCollection, productData);
      alert('Product added');
    }

    setTitle('');
    setPrice('');
    setCategory('');
    setSubcategory('');
    setImage('');
    setExistingImage('');
    setEditingId(null);
    setBestSeller(false);
  };

  const handleEdit = (prod) => {
    setTitle(prod.title);
    setPrice(prod.price);
    setCategory(prod.category);
    setSubcategory(prod.subcategory);
    setImage('');
    setExistingImage(prod.image || '');
    setEditingId(prod.id);
    setBestSeller(!!prod.bestSeller);
    setActiveTab('add');
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm('Delete this product?');
    if (!confirm) return;
    await deleteDoc(doc(db, 'products', id));
  };

  const filteredProducts = products.filter((p) => {
    return (
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.customId + '').includes(searchTerm)
    );
  });

  return (
    <div className="p-4 max-w-4xl mx-auto font-sans">
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${activeTab === 'view' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('view')}
        >
          View Products
        </button>
        <button
          className={`px-4 py-2 rounded ${activeTab === 'add' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          onClick={() => setActiveTab('add')}
        >
          Add / Edit Product
        </button>
      </div>

      {activeTab === 'view' && (
        <>
          <input
            type="text"
            placeholder="Search by name or ID"
            className="mb-4 p-2 border w-full rounded shadow"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="bg-white/80 border border-[#ffe0b2] rounded-2xl shadow-lg p-5 flex flex-col gap-2 items-start hover:shadow-2xl transition-all">
                <div className="flex-1 w-full">
                  <p className="text-xs text-gray-500 mb-1"><span className="font-bold text-[#b86c0e]">ID:</span> {prod.customId}</p>
                  <p className="text-lg font-bold text-[#DA8616] mb-1">{prod.title}</p>
                  <p className="text-base font-semibold text-[#618B4A] mb-1">₹{prod.price}</p>
                  <p className="text-sm font-semibold text-[#4C8577] mb-1">Category: <span className="font-normal text-gray-700">{prod.category}</span></p>
                  <p className="text-sm font-semibold text-[#4C8577] mb-2">Subcategory: <span className="font-normal text-gray-700">{prod.subcategory}</span></p>
                  {prod.image && <img src={prod.image} className="w-full h-32 object-cover rounded-lg border border-[#EAAC8B] mb-2 bg-white" alt={prod.title} />}
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button onClick={() => handleEdit(prod)} className="flex-1 bg-[#4C8577] text-white font-semibold py-2 rounded-lg shadow hover:bg-[#618B4A] transition-all">Edit</button>
                  <button onClick={() => handleDelete(prod.id)} className="flex-1 bg-[#EAAC8B] text-white font-semibold py-2 rounded-lg shadow hover:bg-[#b86c0e] transition-all">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'add' && (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="Category (new or existing)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="text"
            placeholder="Subcategory (new or existing)"
            value={subcategory}
            onChange={(e) => setSubcategory(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="border p-2 w-full"
          />
          {existingImage && !image && (
            <img src={existingImage} alt="Current" className="w-full h-32 object-cover rounded-lg border border-[#EAAC8B] mb-2 bg-white" />
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={bestSeller}
              onChange={e => setBestSeller(e.target.checked)}
            />
            Featured Product
          </label>
          <button onClick={handleAddOrUpdateProduct} className="bg-green-600 text-white px-4 py-2 rounded">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      )}
    </div>
  );
}
