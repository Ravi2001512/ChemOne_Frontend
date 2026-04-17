import { useState, useEffect } from "react";
import API from "../services/api";
import StudentNavbar from "../components/StudentNavbar";
import AdminNavbar from "../components/AdminNavbar";

function Settings() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/auth/me");
        setUser(res.data);
        setFormData({ name: res.data.name, email: res.data.email });
      } catch (err) {
        setError("Failed to load profile details.");
        const localUser = localStorage.getItem("user");
        if (localUser) {
          const u = JSON.parse(localUser);
          setUser(u);
          setFormData({ name: u.name, email: u.email });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.put("/auth/me", formData);
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const isStudent = user?.role === "student";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-200 font-sans pb-12">
      {isStudent ? <StudentNavbar /> : <AdminNavbar />}

      <main className="max-w-4xl mx-auto px-6 pt-24">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Account Settings</h1>
            <p className="text-slate-500">Manage your profile and registration details</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Edit Profile
            </button>
          )}
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-shake">
            <span>⚠️</span> {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-2xl mb-8 flex items-center gap-3">
            <span>✅</span> {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <div className="bg-sky-300 backdrop-blur-md border border-slate-800 rounded-3xl p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-blue-500/20">
                {user?.name?.charAt(0) || "U"}
              </div>

              <h3 className="text-xl font-bold text-white mb-1 truncate">{user?.name}</h3>
              <p className="text-slate-600 text-sm mb-4 truncate">{user?.email}</p>

              <div className="inline-block px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-blue-400 uppercase tracking-wider">
                {user?.role}
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-lime-100 backdrop-blur-md border border-slate-800 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-slate-600 mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  📋
                </span>
                {isEditing ? "Edit Registration Details" : "Registration Details"}
              </h3>

              <form onSubmit={handleUpdate} className="space-y-6">
                {isStudent && (
                  <div className="flex items-center justify-between py-4 border-b border-slate-800/50">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Index Number</p>
                      <p className="text-lg font-mono text-blue-400 font-bold">{user?.indexNumber || "Pending..."}</p>
                    </div>
                    <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg text-[10px] font-bold text-blue-400 uppercase">
                      Official
                    </div>
                  </div>
                )}

                <div className="py-4 border-b border-slate-800/50">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Full Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-slate-400 font-medium">{user?.name}</p>
                  )}
                </div>

                <div className="py-4 border-b border-slate-800/50">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Email Address</p>
                  {isEditing ? (
                    <input
                      type="email"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 outline-none transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-slate-400 font-medium">{user?.email}</p>
                  )}
                </div>

                {isStudent && (
                  <div className="flex items-center justify-between py-4 border-b border-slate-800/50">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Assigned Batch</p>
                      <p className="text-white font-medium">{user?.batch}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-1">Registration Date</p>
                    <p className="text-slate-400 font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : "N/A"}
                    </p>
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-6 flex gap-4">
                    <button
                      type="submit"
                      disabled={updateLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                    >
                      {updateLoading ? "Saving Changes..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ name: user.name, email: user.email });
                      }}
                      className="px-6 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Security Notice */}
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-6 flex gap-4 items-start">
              <span className="text-xl">🛡️</span>
              <div>
                <h4 className="text-sm font-bold text-amber-500 mb-1">Verification Status</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your account is verified and linked to your index number. Please contact administration if you notice any discrepancies in your registration details.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Details Section */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-lg">
                🚀
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Developed By</p>
                <h4 className="text-xl font-bold text-slate-900">CR Sollution</h4>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contact for Support</p>
              <a
                href="tel:0740155058"
                className="text-lg font-mono font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                0740155058
              </a>
            </div>
          </div>
          <p className="text-center text-slate-400 text-[10px] mt-6 tracking-widest font-bold">
            © {new Date().getFullYear()} ChemBridge. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Settings;
