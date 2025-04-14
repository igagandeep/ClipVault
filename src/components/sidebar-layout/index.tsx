"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Category {
  id: string;
  name: string;
}

// 1. Accept selectedCategory + setSelectedCategory from props
interface SidebarLayoutProps {
  children: React.ReactNode;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
}

export default function SidebarLayout({
  children,
  selectedCategory,
  setSelectedCategory,
}: SidebarLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesRef = collection(db, "categories");
      const q = query(categoriesRef, orderBy("name", "asc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const categoriesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesData);
      });
      return () => unsubscribe();
    };
    fetchCategories();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="relative min-h-screen bg-muted text-foreground transition-all duration-300">
      <button
        onClick={toggleSidebar}
        className="fixed bottom-4 left-4 z-50 p-3 bg-gray-800 text-white rounded-full shadow-md"
      >
        {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside
        className={`fixed top-[68px] left-0 h-full bg-gray-200 border-r shadow-md transition-transform duration-300 z-40
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        w-1/2 md:w-1/5`}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Categories</h2>
          <ul className="space-y-2">
            {/* Show 'All Notes' option */}
            <li>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`w-full text-left p-2 rounded ${
                  selectedCategory === null
                    ? "bg-gray-300 font-semibold"
                    : "bg-white"
                }`}
              >
                All Notes
              </button>
            </li>
            {/* Render each category */}
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full text-left p-2 rounded ${
                    selectedCategory === category.name
                      ? "bg-gray-300 font-semibold"
                      : "bg-white"
                  }`}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main
        className={`transition-all duration-300 p-6 max-w-7xl mx-auto ${
          isSidebarOpen ? "ml-1/3 md:ml-1/4" : "ml-0"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
