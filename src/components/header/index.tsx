"use client";

import React, { useState } from "react";
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
import { Textarea } from "../ui/textarea";
import { toast } from "@/hooks/use-toast";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const Header = () => {
  const [note, setNote] = useState("");

  // This function now simply uses the current user from Firebase, assuming they're already authenticated.
  const addNote = async () => {
    if (!note.trim()) {
      toast({
        title: "Note is empty",
        variant: "destructive",
        description: "Please write something.",
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
        content: note.trim(),
        createdAt: serverTimestamp(),
      });
      toast({
        title: "Note saved!",
        description: "Your note has been added to ClipVault.",
      });
      setNote("");
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
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
                  <Textarea
                    placeholder="Write your note, prompt, or snippet here..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[200px]"
                  />
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
