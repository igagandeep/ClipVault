"use client";

import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";
import { Button } from "../ui/button";

interface Note {
  id: string;
  content: string;
  createdAt?: unknown;
}

const NotesList = () => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Reference to the user's notes subcollection
    const notesRef = collection(db, "users", currentUser.uid, "notes");

    // Optionally, sort by the createdAt field (descending)
    const q = query(notesRef, orderBy("createdAt", "desc"));

    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notesData: Note[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Note[];
        setNotes(notesData);
      },
      (error) => {
        console.error("Error fetching notes:", error);
        toast({
          title: "Error fetching notes",
          variant: "destructive",
          description: error.message,
        });
      }
    );

    return () => unsubscribe();
  }, []);

  if (notes.length === 0) {
    return <p className="p-4 text-center">No notes available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="p-4 flex flex-col justify-between">
          <CardContent>
            <p>{note.content}</p>
          </CardContent>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                navigator.clipboard.writeText(note.content);
                toast({
                  title: "Copied!",
                  description: "Note content copied to clipboard.",
                });
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;
