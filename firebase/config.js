import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAteTpRyXu9lh44MuupJWd95YKzmFSBXRA",
  authDomain: "pooja-product-9bc0f.firebaseapp.com",
  projectId: "pooja-product-9bc0f",
  storageBucket: "pooja-product-9bc0f.firebasestorage.app",
  messagingSenderId: "13551138746",
  appId: "1:13551138746:web:eb6e6eaa1cdb95d6c6cf83",
  measurementId: "G-Q245C5FRPC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const categoriesCollection = collection(getFirestore(app), "categories");
export const productsCollection = collection(db, "products");
export const subcategoriesCollection = collection(db, "subcategories");