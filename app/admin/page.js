"use client";

import { useEffect, useState } from "react";
import { db, categoriesCollection } from "../../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadToCloudinary } from "../../utils/cloudinary";

export default function AdminPage() {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    image: null,
    bestSeller: false,
    category: "",
    subcategory: "",
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(categoriesCollection, (snapshot) => {
      const cats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!form.category) {
      setSubcategories([]);
      return;
    }
    const cat = categories.find((c) => c.name === form.category);
    setSubcategories(cat ? cat.subcategories || [] : []);
  }, [form.category, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(editingId ? "Updating product..." : "Uploading product...");

    let imageUrl = null;
    if (form.image && typeof form.image !== "string") {
      imageUrl = await uploadToCloudinary(form.image);
      if (!imageUrl) {
        alert("Image upload failed.");
        setLoading(false);
        setStatusMsg("");
        return;
      }
    }

    const productData = {
      title: form.title,
      description: form.description,
      price: form.price,
      image: imageUrl || form.image,
      bestSeller: form.bestSeller,
      category: form.category,
      subcategory: form.subcategory,
      createdAt: serverTimestamp(),
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "products", editingId), productData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, "products"), productData);
      }
      setStatusMsg("Success! 🎉");
    } catch (err) {
      console.error(err);
      setStatusMsg("Failed to save product.");
    }

    setForm({
      title: "",
      description: "",
      price: "",
      image: null,
      bestSeller: false,
      category: "",
      subcategory: "",
    });
    setLoading(false);
    setTimeout(() => setStatusMsg(""), 2000);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      description: product.description,
      price: product.price,
      image: product.image,
      bestSeller: product.bestSeller || false,
      category: product.category || "",
      subcategory: product.subcategory || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete?");
    if (confirm) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory) return;
    await addDoc(categoriesCollection, {
      name: newCategory,
      subcategories: [],
    });
    setForm({ ...form, category: newCategory, subcategory: "" });
    setNewCategory("");
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategory || !form.category) return;
    const catDoc = categories.find((c) => c.name === form.category);
    if (catDoc) {
      const ref = doc(categoriesCollection, catDoc.id);
      await updateDoc(ref, {
        subcategories: [...(catDoc.subcategories || []), newSubcategory],
      });
      setForm({ ...form, subcategory: newSubcategory });
      setNewSubcategory("");
    }
  };

  const handleDeleteCategory = async (catId) => {
    const confirm = window.confirm("Delete this category and its subcategories?");
    if (!confirm) return;
    await deleteDoc(doc(categoriesCollection, catId));
    if (form.category === catId) {
      setForm({ ...form, category: "", subcategory: "" });
    }
  };

  const handleDeleteSubcategory = async (subToDelete) => {
    const catDoc = categories.find((c) => c.name === form.category);
    if (!catDoc) return;
    const ref = doc(categoriesCollection, catDoc.id);
    const updatedSubs = (catDoc.subcategories || []).filter((s) => s !== subToDelete);
    await updateDoc(ref, { subcategories: updatedSubs });
    if (form.subcategory === subToDelete) {
      setForm({ ...form, subcategory: "" });
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        {editingId ? "Edit Product" : "Add Product"}
      </h1>

      {statusMsg && (
        <div className="mb-4 text-center font-semibold text-blue-700 animate-pulse">
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          disabled={loading}
        />
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
          disabled={loading}
        />
        <input
          className="w-full border p-2 rounded"
          placeholder="Price"
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
          disabled={loading}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          disabled={loading}
        />

        <div className="flex gap-2">
          <select
            className="w-full border p-2 rounded"
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value, subcategory: "" })
            }
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <input
            className="border p-2 rounded"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddCategory}
            className="bg-green-500 text-white px-2 rounded"
          >
            Add
          </button>
        </div>

        {/* Category List */}
        <div className="mt-4">
          <h3 className="font-semibold mb-2">All Categories</h3>
          <ul className="space-y-2">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-2">
                <span className="flex-1">{cat.name}</span>
                <button
                  className="bg-red-500 text-white px-2 rounded text-sm"
                  onClick={() => handleDeleteCategory(cat.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>

        {form.category && (
          <>
            <div className="flex gap-2 mt-4">
              <select
                className="w-full border p-2 rounded"
                value={form.subcategory || ""}
                onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                required
              >
                <option value="">Select Subcategory</option>
                {subcategories.map((sub, i) => (
                  <option key={i} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
              <input
                className="border p-2 rounded"
                placeholder="New Subcategory"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
              />
              <button
                type="button"
                onClick={handleAddSubcategory}
                className="bg-green-500 text-white px-2 rounded"
              >
                Add
              </button>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">
                Subcategories in {form.category}
              </h3>
              <ul className="space-y-2">
                {subcategories.map((sub, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="flex-1">{sub}</span>
                    <button
                      className="bg-red-500 text-white px-2 rounded text-sm"
                      onClick={() => handleDeleteSubcategory(sub)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.bestSeller}
            onChange={(e) => setForm({ ...form, bestSeller: e.target.checked })}
            disabled={loading}
          />
          <span>Best Seller</span>
        </label>

        <button
          type="submit"
          className={`bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading
            ? editingId
              ? "Updating..."
              : "Uploading..."
            : editingId
            ? "Update Product"
            : "Add Product"}
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">All Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white border rounded-lg shadow-md p-4 space-y-3"
            >
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-40 object-contain"
              />
              <h3 className="text-xl font-semibold">{p.title}</h3>
              <p className="text-sm text-gray-600">{p.description}</p>
              <p className="text-orange-600 font-bold">₹{p.price}</p>
              <p className="text-sm text-gray-500">
                Category: {p.category || "N/A"}
              </p>
              {p.bestSeller && (
                <span className="inline-block bg-yellow-300 text-yellow-900 px-2 py-1 text-xs rounded">
                  🌟 Best Seller
                </span>
              )}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleEdit(p)}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
