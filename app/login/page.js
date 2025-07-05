"use client";

import { auth, provider } from "../../firebase/config";
import { signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        router.push("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      setUser(result.user);
      router.push("/admin");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-3xl font-bold mb-6">Login as Admin</h2>
      <button
        onClick={handleLogin}
        className="bg-yellow-500 px-6 py-3 rounded text-white hover:bg-yellow-600 transition-all"
      >
        Sign in with Google
      </button>
    </div>
  );
}
