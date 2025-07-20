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
} from 'firebase/firestore';
import { uploadToCloudinary } from '../../utils/cloudinary';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('view');
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [image, setImage] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [editingId, setEditingId] = useState(null);

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

    const imgURL = image ? await uploadToCloudinary(image) : null;

    // Auto-increment customId
    const q = query(productsCollection, orderBy('customId', 'desc'));
    const snap = await onSnapshot(q, () => {});
    let newId = 1;
    if (snap && !snap.empty) {
      newId = snap.docs[0].data().customId + 1;
    }

    // Add category if doesn't exist
    if (!categories.includes(category)) {
      await addDoc(categoriesCollection, {
        name: category,
        subcategories: [subcategory],
        createdAt: serverTimestamp(),
      });
    } else {
      // Add subcategory if missing
      const catDoc = snap.docs.find((doc) => doc.data().name === category);
      if (catDoc) {
        const catRef = doc(db, 'categories', catDoc.id);
        const existingSubs = catDoc.data().subcategories || [];
        if (!existingSubs.includes(subcategory)) {
          await updateDoc(catRef, {
            subcategories: [...existingSubs, subcategory],
          });
        }
      }
    }

    const productData = {
      title,
      price: parseFloat(price),
      category,
      subcategory,
      image: imgURL,
      customId: editingId ? undefined : newId,
      createdAt: serverTimestamp(),
    };

    if (editingId) {
      const productRef = doc(db, 'products', editingId);
      await updateDoc(productRef, productData);
    } else {
      await addDoc(productsCollection, productData);
    }

    setTitle('');
    setPrice('');
    setCategory('');
    setSubcategory('');
    setImage('');
    setEditingId(null);
  };

  const handleEdit = (prod) => {
    setTitle(prod.title);
    setPrice(prod.price);
    setCategory(prod.category);
    setSubcategory(prod.subcategory);
    setImage('');
    setEditingId(prod.id);
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
            className="mb-4 p-2 border w-full"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((prod) => (
              <div key={prod.id} className="border p-4 shadow rounded">
                <p><strong>ID:</strong> {prod.customId}</p>
                <p><strong>Title:</strong> {prod.title}</p>
                <p><strong>Price:</strong> ₹{prod.price}</p>
                <p><strong>Category:</strong> {prod.category}</p>
                <p><strong>Subcategory:</strong> {prod.subcategory}</p>
                {prod.image && <img src={prod.image} className="w-full h-32 object-cover mt-2" />}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(prod)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(prod.id)} className="text-red-600">Delete</button>
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
          <button onClick={handleAddOrUpdateProduct} className="bg-green-600 text-white px-4 py-2 rounded">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      )}
    </div>
  );
}
