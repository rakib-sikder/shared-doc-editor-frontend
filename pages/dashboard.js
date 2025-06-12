import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "@/googleAuth/firebase";
import axios from "axios";

const initialSharedDocs = [
  { id: "4", title: "Team Vacation Plan", owner: "Alice" },
];

export default function Dashboard() {
  const [myDocuments, setMyDocuments] = useState([]);
  const [sharedDocuments, setSharedDocuments] = useState([]);
  console.log("Shared Documents:", sharedDocuments);
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const currentUser = user && user.email;

  useEffect(() => {
    const token = localStorage.getItem("token");  
    if (!token) {
      console.error("No authentication token found. Please log in."); 
      router.push("/");
      return;
    }
    const fetchDocuments = async () => {
      try {
        const response = await axios.get("https://shared-doc-editor-backend.onrender.com/api/documents", {
          headers: { Authorization: `token ${token}` },
        });
        setMyDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocuments();
  }, [router]); 

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found. Please log in.");
      router.push("/");
      return;
    }
    const fetchSharedDocuments = async () => {
      try {
        const res = await axios.get("https://shared-doc-editor-backend.onrender.com/api/shared-documents", {
          headers: { Authorization: `token ${token}` },
        });
        const allDocuments = res.data.filter(
          (doc) => doc.sharedWith
        );
        console.log("Shared Documents:", allDocuments);
        setSharedDocuments(allDocuments);

      } catch (error) {
        console.error("Error fetching shared documents:", error);
      }
    };
    fetchSharedDocuments();
  }, [])
    

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("token");
        router.push("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const createNewDocument = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in.");
        router.push("/");
        return;
      }
      const newDocId = await axios
        .post("https://shared-doc-editor-backend.onrender.com/api/documents", {
          title: "New Document",
          content: "<p>Start writing your document here...</p>",
        },{headers: { Authorization: `token ${token}` }})
        .then((response) => response.data._id);

      router.push(`/doc/${newDocId}`);
    } catch (error) {
      console.error("Error creating new document:", error);
    }
  };
  const deleteDocument = (doc_Id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found. Please log in.");
      router.push("/");
      return;
    }
    axios
      .delete(`https://shared-doc-editor-backend.onrender.com/api/documents/${doc_Id}`, {
        headers: { Authorization: `token ${token}` },
      })
      .then(() => {
        setMyDocuments((prevDocs) =>
          prevDocs.filter((doc) => doc._id !== doc_Id)
        );
      })
      .catch((error) => {
        console.error("Error deleting document:", error);
      });
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
              src={user?.photoURL || "https://i.pravatar.cc/40"}
              alt="User Avatar"
              className="w-10 h-10 rounded-full"
            />
          </div>
        </div>
        <div className="flex items-center px-4 py-2 space-x-4">
          <button className="px-6 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700"  onClick={handleLogout}>logout</button>
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
                key={doc._id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/doc/${doc._id}`}
                  className="text-lg font-bold text-indigo-700"
                >
                  {doc.title}
                </Link>
                <p className="mt-2 text-sm text-gray-500">
                  Last opened: {doc.updatedAt}
                </p>
                <div className="mt-4 text-right">
                  <button
                    onClick={() => deleteDocument(doc._id)}
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
            {sharedDocuments?.map((doc) => (
              <div
                key={doc._id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/doc/${doc._id}`}
                  className="text-lg font-bold text-indigo-700"
                >
                  {doc.title}
                </Link>
                <p className="mt-2 text-sm text-gray-500">
                  Owner: {doc.owner?.fullName || "Unknown"}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
