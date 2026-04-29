import React, { useState, useEffect } from "react";
import AdminNavbar from "../../components/AdminNavbar";
import API from "../../services/api";
import { 
  FiUploadCloud, 
  FiTrash2, 
  FiExternalLink, 
  FiFileText, 
  FiCheckCircle, 
  FiLoader, 
  FiAlertCircle 
} from "react-icons/fi";

const ManageKnowledge = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fetchKnowledge = async () => {
    try {
      const res = await API.get("/admin/knowledge");
      setFiles(res.data.data);
    } catch (error) {
      console.error("Error fetching knowledge base:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  // Poll for updates if any file is indexing or uploading
  useEffect(() => {
    const hasPendingFiles = files.some(
      (f) => f.status === "uploading" || f.status === "indexing"
    );

    let intervalId;
    if (hasPendingFiles) {
      intervalId = setInterval(() => {
        fetchKnowledge();
      }, 5000); // Check every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [files]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      uploadFile(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file) => {
    if (!file || file.type !== "application/pdf") {
      alert("Please upload a PDF file.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      await API.post("/admin/ingest-pdf", formData, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
      fetchKnowledge();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload and index PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this knowledge source?")) return;

    try {
      await API.delete(`/admin/knowledge/${id}`);
      setFiles(files.filter(f => f._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete knowledge source.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "ready":
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1"><FiCheckCircle /> Ready</span>;
      case "indexing":
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1 animate-pulse"><FiLoader className="animate-spin" /> Indexing</span>;
      case "uploading":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium flex items-center gap-1"><FiLoader className="animate-spin" /> Uploading</span>;
      case "error":
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1"><FiAlertCircle /> Error</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-500 mt-1">Manage the PDFs that power your ChemFriend AI 🧪</p>
          </div>
        </div>

        {/* Upload Section */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-12 text-center transition-all ${
            dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white"
          } mb-8`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <FiLoader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-lg font-medium text-gray-700">Processing & Indexing PDF...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a minute for large files.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
                <FiUploadCloud size={32} />
              </div>
              <p className="text-lg font-medium text-gray-900">
                Drag and drop your PDF here, or{" "}
                <label className="text-indigo-600 cursor-pointer hover:underline">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) => uploadFile(e.target.files[0])}
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500 mt-2">Maximum file size: 50MB</p>
            </div>
          )}
        </div>

        {/* Files List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-700">Indexed Knowledge Sources ({files.length})</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <FiLoader className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Loading knowledge base...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiFileText size={32} />
              </div>
              <p className="text-gray-900 font-medium text-lg">No files indexed yet</p>
              <p className="text-gray-500">Upload a PDF to start training your AI chatbot.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                    <th className="px-6 py-4">File Name</th>
                    <th className="px-6 py-4">Size</th>
                    <th className="px-6 py-4">Chunks</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {files.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                            <FiFileText size={18} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 truncate max-w-xs">{file.fileName}</p>
                            <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {file.chunkCount || "-"}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(file.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <a 
                            href={file.gcsUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="View File"
                          >
                            <FiExternalLink size={18} />
                          </a>
                          <button
                            onClick={() => handleDelete(file._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageKnowledge;
