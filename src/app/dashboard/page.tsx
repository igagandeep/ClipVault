"use client";

import { useState } from "react";
import SidebarLayout from "@/components/sidebar-layout";
import NotesList from "@/components/notes";

export default function DashboardPage() {
  // 1. Track selectedCategory here (the parent page)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <SidebarLayout
      // 2. Pass selectedCategory + setter to the layout
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
    >
      <h1 className="text-2xl font-bold mb-4">Your Notes</h1>
      <NotesList selectedCategory={selectedCategory} />
    </SidebarLayout>
  );
}
