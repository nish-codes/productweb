'use client';
import { useEffect, useState } from 'react';
import {
  onSnapshot,
  getDocs,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  productsCollection,
  categoriesCollection,
  db,
  auth,
} from '../../firebase/config';
import { uploadToCloudinary } from '../../utils/cloudinary';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('view');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [imgFile, setImgFile] = useState(null);
  const [existingImg, setExistingImg] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [newSubcategory, setNewSubcategory] = useState('');
  const [bestSeller, setBestSeller] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  // Add state for category image upload
  const [catImgFile, setCatImgFile] = useState(null);
  const [catImgUploading, setCatImgUploading] = useState(false);
  const [catImgPreview, setCatImgPreview] = useState("");

  // No limit for categories

  // Check authentication
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Live updates
  useEffect(() => {
    const unsubP = onSnapshot(productsCollection, snap => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubC = onSnapshot(categoriesCollection, snap => {
      const cats = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setCategories(cats);
      setSubcategories([...new Set(cats.flatMap(c => c.subcategories || []))]);
    });
    return () => { unsubP(); unsubC(); };
  }, []);

  const resetForm = () => {
    setTitle('');
    setPrice('');
    setImgFile(null);
    setExistingImg('');
    setCategory('');
    setNewCategory('');
    setSubcategory('');
    setNewSubcategory('');
    setBestSeller(false);
    setEditingId(null);
  };

  const showMessage = msg => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleSaveProduct = async () => {
    const finalCat = (newCategory.trim() || category.trim()).trim();
    const finalSub = (newSubcategory.trim() || subcategory.trim()).trim();

    if (!title.trim() || !price || !finalCat || !finalSub) {
      return alert('Fill all fields!');
    }

    setUploading(true);
    let imgURL = existingImg;
    if (imgFile) imgURL = await uploadToCloudinary(imgFile);

    const snapC = await getDocs(categoriesCollection);
    const catDocs = snapC.docs.map(d => ({ id: d.id, ...d.data() }));
    const found = catDocs.find(c =>
      c.name.trim().toLowerCase() === finalCat.toLowerCase()
    );

    if (!found) {
      const ref = await addDoc(categoriesCollection, {
        name: finalCat,
        subcategories: [finalSub],
        createdAt: serverTimestamp(),
      });
      found && (found.id = ref.id);
    } else {
      const existsSub = (found.subcategories || [])
        .some(s => s.trim().toLowerCase() === finalSub.toLowerCase());
      if (!existsSub) {
        await updateDoc(doc(db, 'categories', found.id), {
          subcategories: [...(found.subcategories || []), finalSub],
        });
      }
    }

    const snapP = await getDocs(query(productsCollection, orderBy('customId', 'desc')));
    const nextId = snapP.empty ? 1 : snapP.docs[0].data().customId + 1;

    const data = {
      title: title.trim(),
      price: parseFloat(price),
      category: finalCat,
      subcategory: finalSub,
      image: imgURL,
      bestSeller,
      createdAt: serverTimestamp(),
    };

    if (editingId) {
      await updateDoc(doc(db, 'products', editingId), data);
      showMessage('Product updated!');
    } else {
      data.customId = nextId;
      await addDoc(productsCollection, data);
      showMessage('Product added!');
    }

    resetForm();
    setTab('view');
    setUploading(false);
  };

  const handleEditProduct = p => {
    setTitle(p.title);
    setPrice(p.price);
    setExistingImg(p.image || '');
    setCategory(p.category);
    setSubcategory(p.subcategory);
    setBestSeller(!!p.bestSeller);
    setEditingId(p.id);
    setImgFile(null);
    setTab('add');
  };

  const handleDeleteProduct = async id => {
    if (confirm('Delete this product?')) {
      await deleteDoc(doc(db, 'products', id));
    }
  };

  const filtered = products.filter(p =>
    (p.title && p.title.toLowerCase().includes(search.toLowerCase())) ||
    `${p.customId}`.includes(search)
  );

  // Count featured products
  const featuredCount = products.filter(p => p.bestSeller && (!editingId || p.id !== editingId)).length;

  // Get user initials
  const getUserInitials = (displayName, email) => {
    if (displayName) {
      return displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Logo Section */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">SMB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <button 
            onClick={() => { resetForm(); setTab('view'); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              tab === 'view' 
                ? 'bg-green-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button 
            onClick={() => { resetForm(); setTab('add'); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              tab === 'add' 
                ? 'bg-green-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span>Products</span>
          </button>

          <button 
            onClick={() => { setTab('cat'); setSidebarOpen(false); }}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              tab === 'cat' 
                ? 'bg-green-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
            <span>Categories</span>
          </button>
        </nav>

        {/* Logout Section */}
        <div className="absolute bottom-4 left-4 right-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">
                {getUserInitials(user.displayName, user.email)}
              </span>
            </div>
            <span>→ Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-black text-white px-4 lg:px-6 py-4 flex justify-between items-center">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <h1 className="text-lg lg:text-xl font-bold">DashBoard</h1>
          
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="hidden sm:block">
              <span className="text-sm">{user.displayName || 'User'}</span>
            </div>
            <div className="hidden md:block">
              <span className="text-sm text-gray-300">{user.email}</span>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-gray-600 font-bold text-sm">
                {getUserInitials(user.displayName, user.email)}
              </span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="mb-6">
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
          </div>

          {message && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}

          {tab === 'view' && (
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <div className="mb-6">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {filtered.map(p => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    {p.image && (
                      <img src={p.image} alt={p.title} className="w-full h-32 sm:h-48 object-cover rounded-t-lg" />
                    )}
                    <div className="p-3 lg:p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base truncate">{p.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-600 mb-1">ID: {p.customId}</p>
                      <p className="text-base lg:text-lg font-bold text-green-600 mb-1">₹{p.price}</p>
                      <p className="text-xs lg:text-sm text-gray-500 mb-3 truncate">{p.category} / {p.subcategory}</p>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditProduct(p)} 
                          className="flex-1 bg-green-500 text-white py-1 lg:py-2 px-2 lg:px-3 rounded-lg text-xs lg:text-sm hover:bg-green-600 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(p.id)} 
                          className="flex-1 bg-red-500 text-white py-1 lg:py-2 px-2 lg:px-3 rounded-lg text-xs lg:text-sm hover:bg-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'add' && (
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold mb-6">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }} className="space-y-4 lg:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Title</label>
                    <input 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder="Enter product title" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={uploading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input 
                      value={price} 
                      type="number" 
                      onChange={e => setPrice(e.target.value)} 
                      placeholder="Enter price" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Category</label>
                    <input 
                      list="catlist" 
                      value={category}
                      onChange={e => {setCategory(e.target.value); setNewCategory('')}} 
                      placeholder="Choose existing category" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={uploading}
                    />
                    <datalist id="catlist">
                      {categories.map(c => <option key={c.id} value={c.name} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add New Category</label>
                    <input 
                      value={newCategory}
                      onChange={e => {setNewCategory(e.target.value); setCategory('')}} 
                      placeholder="Enter new category name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Subcategory</label>
                    <input 
                      list="sublist" 
                      value={subcategory}
                      onChange={e => {setSubcategory(e.target.value); setNewSubcategory('')}} 
                      placeholder="Choose existing subcategory" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={uploading}
                    />
                    <datalist id="sublist">
                      {subcategories.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add New Subcategory</label>
                    <input 
                      value={newSubcategory}
                      onChange={e => {setNewSubcategory(e.target.value); setSubcategory('')}} 
                      placeholder="Enter new subcategory name" 
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={uploading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                  <input 
                    type="file" 
                    onChange={e => setImgFile(e.target.files[0])} 
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={uploading}
                  />
                  {existingImg && !imgFile && (
                    <img src={existingImg} alt="Current product image" className="w-full h-32 lg:h-48 object-cover rounded-lg mt-2" />
                  )}
                </div>

                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={bestSeller} 
                    onChange={e => setBestSeller(e.target.checked)}
                    disabled={!bestSeller && featuredCount >= 3}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Feature Product</label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
              </form>
            </div>
          )}

          {tab === 'cat' && (
            <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
              <h3 className="text-lg lg:text-xl font-semibold mb-6">Manage Categories</h3>
              <div className="space-y-4">
                {categories.map(cat => (
                  <div key={cat.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border border-gray-200 rounded-lg space-y-3 lg:space-y-0">
                    <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-4 flex-1">
                      <input 
                        defaultValue={cat.name}
                        onBlur={e => updateDoc(doc(db, 'categories', cat.id), { name: e.target.value.trim() })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {cat.image && (
                        <img src={cat.image} alt="" className="h-12 w-12 object-cover rounded-lg border" />
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={async e => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setCatImgUploading(true);
                          const url = await uploadToCloudinary(file);
                          await updateDoc(doc(db, 'categories', cat.id), { image: url });
                          setCatImgUploading(false);
                        }} 
                        className="text-sm"
                      />
                      {catImgUploading && <span className="text-xs text-blue-600">Uploading…</span>}
                    </div>
                    <button 
                      onClick={() => deleteDoc(doc(db, 'categories', cat.id))}
                      className="lg:ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
