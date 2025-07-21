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
} from '../../firebase/config';
import { uploadToCloudinary } from '../../utils/cloudinary';

export default function AdminPage() {
  const [tab, setTab] = useState('view');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [search, setSearch] = useState('');

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

  return (
    <div className="p-6 mx-auto max-w-4xl space-y-6">
      <nav className="flex gap-4">
        <button onClick={() => { resetForm(); setTab('view'); }}
          className={`px-4 py-2 rounded ${tab==='view' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>View Products</button>
        <button onClick={() => { resetForm(); setTab('add'); }}
          className={`px-4 py-2 rounded ${tab==='add' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Add / Edit Product</button>
        <button onClick={() => setTab('cat')}
          className={`px-4 py-2 rounded ${tab==='cat' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>Manage Categories</button>
      </nav>

      {message && <p className="bg-green-100 text-green-800 text-center p-2 rounded">{message}</p>}

      {tab === 'view' && (
        <div>
          <input type="text" placeholder="Search..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="border w-full mb-4 p-2 rounded" />
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filtered.map(p => (
              <div key={p.id} className="bg-white rounded shadow p-4 flex flex-col">
                {p.image && <img src={p.image} alt="" className="h-32 w-full object-cover rounded mb-2" />}
                <h3 className="font-bold">{p.title}</h3>
                <p>ID: {p.customId}</p>
                <p>₹{p.price}</p>
                <p>{p.category} / {p.subcategory}</p>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => handleEditProduct(p)} className="flex-1 bg-green-600 text-white py-1 rounded">Edit</button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="flex-1 bg-red-500 text-white py-1 rounded">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'add' && (
        <div className="bg-white p-6 rounded shadow space-y-4">
          <fieldset disabled={uploading} className="space-y-3">
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" />
            <input value={price} type="number" onChange={e=>setPrice(e.target.value)} placeholder="Price" className="w-full p-2 border rounded" />

            <div className="grid sm:grid-cols-2 gap-2">
              <div><label>Select Category</label>
                <input list="catlist" value={category}
                  onChange={e=>{setCategory(e.target.value);setNewCategory('')}} placeholder="Choose or type" className="w-full p-2 border rounded" />
                <datalist id="catlist">{categories.map(c=> <option key={c.id} value={c.name} />)}</datalist>
              </div>
              <div><label>Add New Category</label>
                <input value={newCategory}
                  onChange={e=>{setNewCategory(e.target.value);setCategory('')}} placeholder="New category" className="w-full p-2 border rounded" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <div><label>Select Subcategory</label>
                <input list="sublist" value={subcategory}
                  onChange={e=>{setSubcategory(e.target.value);setNewSubcategory('')}} placeholder="Choose or type" className="w-full p-2 border rounded" />
                <datalist id="sublist">{subcategories.map(s => <option key={s} value={s} />)}</datalist>
              </div>
              <div><label>Add New Subcategory</label>
                <input value={newSubcategory}
                  onChange={e=>{setNewSubcategory(e.target.value);setSubcategory('')}} placeholder="New subcategory" className="w-full p-2 border rounded" />
              </div>
            </div>

            <div><input type="file" onChange={e=>setImgFile(e.target.files[0])} />
              {existingImg && !imgFile && <img src={existingImg} alt="" className="w-full h-32 object-cover rounded mt-2" />}
            </div>

            <label>
              <input type="checkbox" checked={bestSeller} onChange={e=>setBestSeller(e.target.checked)} /> Feature Product
            </label>
            <button onClick={handleSaveProduct} className="w-full bg-blue-600 text-white py-2 rounded">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </fieldset>
          {uploading && <p className="text-center text-blue-600">Uploading… Please wait.</p>}
        </div>
      )}

      {tab === 'cat' && (
        <div className="bg-white p-4 rounded shadow space-y-4">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-start justify-between gap-2">
              <input defaultValue={cat.name}
                onBlur={e=>updateDoc(doc(db, 'categories', cat.id), { name: e.target.value.trim() })}
                className="flex-1 p-2 border rounded" />
              <button onClick={()=> deleteDoc(doc(db,'categories',cat.id))}
                className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
