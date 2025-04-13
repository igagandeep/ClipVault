import NotesList from "@/components/notes";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Saved Notes</h1>
      <NotesList />
    </div>
  );
}
