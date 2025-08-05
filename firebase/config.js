import { initializeApp } from "firebase/app";
import { getAuth , GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBZ4uzXGG-1_R4yuFWNyRzul0G9qlYCZKo",
  authDomain: "pooja-product-f194d.firebaseapp.com",
  projectId: "pooja-product-f194d",
  storageBucket: "pooja-product-f194d.firebasestorage.app",
  messagingSenderId: "314419865300",
  appId: "1:314419865300:web:5b8dbb59a40425ed487d41",
  measurementId: "G-HG6FWV75N0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const categoriesCollection = collection(getFirestore(app), "categories");
export const productsCollection = collection(db, "products");
export const subcategoriesCollection = collection(db, "subcategories");