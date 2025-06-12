import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import axios from "axios";
import { io } from "socket.io-client";

import "quill/dist/quill.snow.css";

export default function DocumentEditorPage() {
  const router = useRouter();
  const { id: docId } = router.query;

  const [docTitle, setDocTitle] = useState("Loading...");
  const [docContent, setDocContent] = useState("");
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);

  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState("viewer");

  useEffect(() => {
    if (docId == null) return;

    const socketInstance = io("https://shared-doc-editor-backend.onrender.com");
    setSocket(socketInstance);

    const setupEditorAndListeners = async () => {
      if (editorContainerRef.current == null || quillRef.current != null)
        return;

      // Dynamically import Quill ONLY on the client-side
      const Quill = (await import("quill")).default;

      const editor = new Quill(editorContainerRef.current, {
        theme: "snow",
        modules: { toolbar: true },
      });
      quillRef.current = editor;

      editor.disable();
      editor.setText("Loading content...");

      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      try {
        const res = await axios.get(
          `https://shared-doc-editor-backend.onrender.com/api/documents/${docId}`,
          {
            headers: { Authorization: `token ${token}` },
          }
        );

        setDocTitle(res.data.title);
        setDocContent(res.data.content);
        editor.setText(res.data.content);
        editor.enable();
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.msg || "Could not fetch document.");
        setLoading(false);
        return;
      }

      socketInstance.emit("join-document", docId);

      const receiveChangeHandler = (delta) => {
        if (quillRef.current) {
          quillRef.current.updateContents(delta);
        }
      };
      socketInstance.on("receive-text-change", receiveChangeHandler);

      const textChangeHandler = (delta, oldDelta, source) => {
        console.log("Text change detected:", delta, source);
        if (source === "user") {
          socketInstance.emit("text-change", delta, docId);
        }
      };
      editor.on("text-change", textChangeHandler);
    };

    setupEditorAndListeners();

    return () => {
      socketInstance.disconnect();
    };
  }, [docId, router]);

  // Save Document Logic

  useEffect(() => {
    if (!quillRef.current || loading || error) return;

    const saveContent = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found. Please log in.");
        router.push("/");
        return;
      }

      try {
        const content = quillRef.current.getText();

        setDocContent(content);

        const res = await axios.put(
          `https://shared-doc-editor-backend.onrender.com/api/documents/${docId}`,
          { title: docTitle, content: content },
          { headers: { Authorization: `token ${token}` } } 
        );
      } catch (err) {
        console.error(
          "Error saving document:",
          err.response?.data?.msg || "Failed to save document."
        );
      }
    };

    const saveInterval = setInterval(saveContent, 2000); 

    return () => clearInterval(saveInterval);
  }, [docId, quillRef, docTitle, docContent]);

  // Share Document Logic
  const handleShare = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `https://shared-doc-editor-backend.onrender.com/api/documents/${docId}/share`,
        { email: shareEmail, role: shareRole },
        { headers: { Authorization: `token ${token}` } } // Use the correct header name
      );
      alert(res.data.msg || "Document shared successfully!");
      setShareModalOpen(false);
      setShareEmail("");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to share document.");
    }
  };
  // if (loading) {
  //   return <div className="text-center">Loading...</div>;
  // }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between p-4 bg-white shadow-md">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="mr-4 text-indigo-600 hover:underline"
          >
            ← Dashboard
          </Link>
          <input
            type="text"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            className="text-2xl font-bold text-gray-800 bg-transparent focus:outline-none focus:bg-gray-200 rounded-md px-2"
          />
        </div>
        <div>
          <button
            onClick={() => setShareModalOpen(true)}
            className="px-4 py-2 mr-2 font-semibold text-white bg-green-500 rounded-md hover:bg-green-600"
          >
            Share
          </button>
        </div>
      </header>

      <main className="max-w-4xl p-8 mx-auto">
        <div className="bg-white shadow-lg">
          <div ref={editorContainerRef} className="min-h-[70vh]"></div>
        </div>
      </main>

      {/* Share Modal Logic */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <form
            onSubmit={handleShare}
            className="w-full max-w-lg p-6 bg-white rounded-lg"
          >
            <h3 className="mb-4 text-xl font-bold">Share {docTitle}</h3>
            <input
              type="email"
              placeholder="Enter email to share with..."
              required
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="my-4">
              <select
                value={shareRole}
                onChange={(e) => setShareRole(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShareModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-indigo-600 rounded-md"
              >
                Share
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
