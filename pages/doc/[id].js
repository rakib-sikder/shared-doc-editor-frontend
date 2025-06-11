import { useRouter } from "next/router";
import { useState, useEffect, use } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Link from "next/link";
import axios from "axios";
import { io } from "socket.io-client";

const QuillNoSSR = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const onlineUsers = [
  { id: "1", name: "Alex", avatar: "https://i.pravatar.cc/40?u=1" },
  { id: "2", name: "Maria", avatar: "https://i.pravatar.cc/40?u=2" },
];

export default function DocumentEditorPage() {
  const router = useRouter();
  const { id: docId } = router.query;
  const [docTitle, setDocTitle] = useState("Loading...");
  const [content, setContent] = useState("");
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const socket = io("http://localhost:5000");
  const [selectedRole, setSelectedRole] = useState("viewer");
  const [email, setEmail] = useState(""); 

  const handleEmailChange = (e) => {
    setEmail(e.target.value); 
  };
  const handleSelectChange = (e) => {
    setSelectedRole(e.target.value); 
  };

  const handleShare = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in.");
        router.push("/");
        return;
      }
      const response = await axios.post(
        `http://localhost:5000/api/documents/${docId}/share`,
        {
          email: email,
          role: selectedRole,
        },
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      console.log("Document shared successfully:", response.data);
      setShareModalOpen(false);
    } catch (error) {
      console.error("Error sharing document:", error);
    }
  
  }

  useEffect(() => {
    if (!docId) {
      console.error("Document ID is not available");
      return;
    }

    // Initialize socket connection
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    // Listen for real-time updates
    socket.on(`document-${docId}`, (data) => {
      console.log("Real-time update received:", data);
      setContent(data.content);
      setDocTitle(data.title);
    });

    return () => {
      socket.off(`document-${docId}`);
      socket.disconnect();
    };
  }, [docId, socket]);

  useEffect(() => {
    const fetchDocument = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in.");
        router.push("/");
        return;
      }

      try {
        const response = await fetch(
          `http://localhost:5000/api/documents/${docId}`,
          {
            headers: { Authorization: `token ${token}` },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch document");
        }

        const data = await response.json();
        console.log("Fetched document:", data);
        setDocTitle(data.title);
        setContent(data.content);
      } catch (error) {
        console.error("Error fetching document:", error);
        setDocTitle("Error loading document");
      }
    };

    fetchDocument();
  }, [docId, router]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in.");
        router.push("/");
        return;
      }
      axios.put(
        `http://localhost:5000/api/documents/${docId}`,
        {
          title: docTitle,
          content: content,
        },
        {
          headers: { Authorization: `token ${token}` },
        }
      );
    }, 2000);

    return () => {
      clearTimeout(handler);
    };
  }, [content, docId, docTitle, router]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Editor Header */}
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="mr-4 text-indigo-600 hover:underline"
          >
            ← Back to Dashboard\
          </Link>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="text-2xl font-bold text-gray-800 bg-transparent focus:outline-none focus:bg-gray-200 rounded-md px-2"
          />
        </div>
        <div className="flex items-center">
          {/* User Presence */}
          <div className="flex -space-x-2 mr-4">
            {onlineUsers.map((user) => (
              <img
                key={user.id}
                className="inline-block w-10 h-10 rounded-full ring-2 ring-white"
                src={user.avatar}
                alt={user.name}
                title={user.name}
              />
            ))}
          </div>
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2 mr-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            Share
          </button>
          <img
            src="https://i.pravatar.cc/40"
            alt="My Avatar"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </header>

      {/* The Editor */}
      <main className="max-w-4xl p-8 mx-auto">
        <div className="bg-white shadow-lg">
          <QuillNoSSR
            theme="snow"
            value={content}
            onChange={setContent}
            className="min-h-[70vh]"
          />
        </div>
      </main>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <form className="w-full max-w-lg p-6 bg-white rounded-lg">
            <h3 className="mb-4 text-xl font-bold">Share {docTitle}</h3>
            <input
              type="email"
              placeholder="Enter email to share with..."
              className="w-full px-3 py-2 border rounded-md"
              onChange={handleEmailChange}
            />
            <div className="my-4">
              <select value={selectedRole} onChange={handleSelectChange} className="w-full px-3 py-2 border rounded-md">
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button onClick={handleShare} className="px-4 py-2 text-white bg-indigo-600 rounded-md">
                Share
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
