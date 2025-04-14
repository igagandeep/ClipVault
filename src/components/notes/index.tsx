"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Copy, Trash } from "lucide-react";
import { Button } from "../ui/button";

interface Note {
  id: string;
  title: string;
  description : string;
  createdAt?: unknown;
}

interface NotesListProps {
  selectedCategory: string | null;
}

const NotesList = ({ selectedCategory }: NotesListProps) => {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Reference to the user's notes subcollection
    const notesRef = collection(db, "users", currentUser.uid, "notes");

    // If a category is selected, add a where filter; otherwise, just order by createdAt
    const q =
      selectedCategory && selectedCategory.trim().length > 0
        ? query(
            notesRef,
            where("category", "==", selectedCategory),
            orderBy("createdAt", "desc")
          )
        : query(notesRef, orderBy("createdAt", "desc"));

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
  }, [selectedCategory]);

  const handleDeleteNote = async (noteId: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const noteRef = doc(db, "users", currentUser.uid, "notes", noteId);
    try {
      await deleteDoc(noteRef);
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully.",
      });
    } catch (error: unknown) {
      console.error("Error deleting note:", error);

      // Narrow the type of error
      if (error instanceof Error) {
        toast({
          title: "Error deleting note",
          variant: "destructive",
          description: "Unable to delete the note. Please try again later.",
        });
      } else {
        toast({
          title: "Error deleting note",
          variant: "destructive",
          description: "An unknown error occurred.",
        });
      }
    }
  };

  if (notes.length === 0) {
    return <p className="p-4 text-center">No notes available yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {notes.map((note) => (
        <Card key={note.id} className="p-4 h-60 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-lg font-semibold truncate">
              {note.title}
            </CardTitle>
            {/* <p className="text-sm text-muted-foreground">
              {new Date(note.createdAt?.toString()).toLocaleDateString()}
            </p> */}
          </CardHeader>
          <CardContent className="overflow-y-auto">
            <p>{note.description}</p>
          </CardContent>
          <div className="flex justify-end mt-2">
            <Button
              variant="outline"
              className="mr-2"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(note.title + note.description);
                toast({
                  title: "Copied!",
                  description: "Note content copied to clipboard.",
                });
              }}
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteNote(note.id)}
              className="bg-red-400 hover:bg-red-300"
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default NotesList;
