"use client";

import React, { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Category {
  id: string;
  name: string;
}

const Header = () => {
  // New state variables for title and description
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoryList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoryList as Category[]);
    };
    fetchCategories();
  }, []);

  const addNote = async () => {
    if (!title.trim()) {
      toast({
        title: "Title is empty",
        variant: "destructive",
        description: "Please write a title for your note.",
      });
      return;
    }

    if (!desc.trim()) {
      toast({
        title: "Description is empty",
        variant: "destructive",
        description: "Please write a description for your note.",
      });
      return;
    }

    if (!selectedCategory) {
      toast({
        title: "Category not selected",
        variant: "destructive",
        description: "Please select a category for your note.",
      });
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      toast({
        title: "Not authenticated",
        variant: "destructive",
        description: "Please log in to save notes.",
      });
      return;
    }

    try {
      await addDoc(collection(db, "users", currentUser.uid, "notes"), {
        title: title.trim(),
        description: desc.trim(),
        category: selectedCategory,
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Note saved!",
        description: "Your note has been added to ClipVault.",
      });
      // Clear the input fields after saving
      setTitle("");
      setDesc("");
      setSelectedCategory("");
    } catch (error) {
      console.error("Error saving note:", error);
      toast({
        title: "Error saving note",
        variant: "destructive",
        description: "Please try again later.",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: unknown) {
      console.error("Error saving note:", error);
      toast({
        title: "Error logging out",
        variant: "destructive",
        description: "Please try again later.",
      });
    }
  };

  return (
    <header>
      <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
        <h1 className="text-2xl font-bold">ClipVault</h1>
        <nav className="flex items-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-transparent hover:bg-transparent">
                <Plus className="h-4 w-4" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle className="mb-2 text-2xl">Add Note</DialogTitle>
                <DialogDescription>
                  <div className="flex flex-col gap-4">
                    {/* Input for the title */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <Input
                        placeholder="Enter note title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full"
                      />
                    </div>
                    {/* Textarea for the description */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Textarea
                        placeholder="Write your note description..."
                        value={desc}
                        onChange={(e) => setDesc(e.target.value)}
                        className="min-h-[200px] w-full"
                      />
                    </div>
                    {/* Dropdown for category selection */}
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Category
                      </label>
                      <Select onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button onClick={addNote}>Save Note</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Button
            className="bg-transparent hover:bg-transparent"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
