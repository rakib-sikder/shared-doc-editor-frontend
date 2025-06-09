import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/googleAuth/firebase";

// Dummy data - replace with API call
const initialMyDocs = [
  { id: "1", title: "Project Proposal", lastOpened: "2 hours ago" },
  { id: "2", title: "Meeting Notes", lastOpened: "Yesterday" },
  { id: "3", title: "Draft for Blog Post", lastOpened: "3 days ago" },
];

const initialSharedDocs = [
  { id: "4", title: "Team Vacation Plan", owner: "Alice" },
];

export default function Dashboard() {
  const [myDocuments, setMyDocuments] = useState(initialMyDocs);
  const [sharedDocuments, setSharedDocuments] = useState(initialSharedDocs);
  const router = useRouter();
  const { user, isLoading } = useAuth();
  console.log("User:", user, "Loading:", isLoading);
  const currentUser = user && user.email;

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        router.push("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const createNewDocument = () => {
    const newDocId = Math.random().toString(36).substring(7);
    console.log("Creating new document...");
    router.push(`/doc/${newDocId}`);
  };

  const deleteDocument = (docId) => {
    setMyDocuments(myDocuments.filter((doc) => doc.id !== docId));
    console.log(`Deleting document ${docId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm flex items-center justify-between">
        <div className="container px-4 py-4 mx-auto d-flex justify-content-between align-items-center">
          <h1 className="text-2xl font-bold text-gray-800">MyDocs</h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">{currentUser}</span>
            <img
              src="https://i.pravatar.cc/40"
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>
        <div>
          <button onClick={handleLogout}>logout</button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container p-4 mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-semibold text-gray-700">Dashboard</h2>
          <button
            onClick={createNewDocument}
            className="px-6 py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            + New Document
          </button>
        </div>

        {/* My Documents Section */}
        <section>
          <h3 className="mb-4 text-2xl font-semibold text-gray-600">
            My Documents
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {myDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/doc/${doc.id}`}
                  className="text-lg font-bold text-indigo-700"
                >
                  {doc.title}
                </Link>
                <p className="mt-2 text-sm text-gray-500">
                  Last opened: {doc.lastOpened}
                </p>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="text-sm font-medium text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Shared With Me Section */}
        <section className="mt-12">
          <h3 className="mb-4 text-2xl font-semibold text-gray-600">
            Shared With Me
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {sharedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/doc/${doc.id}`}
                  className="text-lg font-bold text-indigo-700"
                >
                  {doc.title}
                </Link>
                <p className="mt-2 text-sm text-gray-500">Owner: {doc.owner}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
