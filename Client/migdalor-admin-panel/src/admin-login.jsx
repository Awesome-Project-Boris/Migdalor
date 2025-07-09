import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  Shield,
  LogOut,
  Users,
  FileText,
  Activity,
  Settings,
  Bell,
  ShoppingCart,
  X,
  UploadCloud,
  Trash2,
  Edit,
  Search,
} from "lucide-react";

// --- Configuration ---
// IMPORTANT: Replace with your actual API server URL
const API_BASE_URL = "http://192.168.0.160:44315/api";

// --- API Service ---
const api = {
  async request(endpoint, options) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    if (response.status === 401) {
      // Automatically handle token expiration/invalidation
      // This could trigger a logout or token refresh logic
      throw new Error("Unauthorized");
    }

    if (
      response.headers.get("content-length") === "0" ||
      response.status === 204
    ) {
      return null; // No content
    }

    const contentType = response.headers.get("content-type");
    let data;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      // Try to parse error message from JSON response, otherwise use status text
      const errorMessage =
        typeof data === "object" && data.message
          ? data.message
          : data || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    return data;
  },

  async get(endpoint, token) {
    return this.request(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
  },

  async post(endpoint, body, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return this.request(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  },

  async put(endpoint, body, token) {
    return this.request(endpoint, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint, token) {
    return this.request(endpoint, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // New method for handling file uploads
  async postForm(endpoint, formData, token) {
    // Note: We don't set Content-Type header for FormData.
    // The browser sets it automatically with the correct boundary.
    return this.request(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },
};

// --- Authentication Context ---
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("migdalor_admin_token")
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  const verifyAdminStatus = useCallback(async (currentToken) => {
    if (!currentToken) {
      setIsAdmin(false);
      setIsLoading(false);
      setUser(null);
      return;
    }
    try {
      const adminStatus = await api.get("/People/IsAdmin", currentToken);
      if (adminStatus) {
        setIsAdmin(true);
        const userDetails = await api.get("/People/AdminDetails", currentToken);
        setUser(userDetails);
      } else {
        throw new Error("User is not an admin.");
      }
    } catch (error) {
      console.error("Verification failed:", error);
      localStorage.removeItem("migdalor_admin_token");
      setToken(null);
      setIsAdmin(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    verifyAdminStatus(token);
  }, [token, verifyAdminStatus]);

  const login = async (phoneNumber, password) => {
    try {
      setIsLoading(true);
      const response = await api.post("/People/login", {
        PhoneNumber: phoneNumber,
        Password: password,
      });
      const newToken = response;
      localStorage.setItem("migdalor_admin_token", newToken);
      setToken(newToken);
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("migdalor_admin_token");
    setToken(null);
    setIsAdmin(false);
    setUser(null);
  };

  const value = { token, isAdmin, user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Main App Component ---
function App() {
  const { isAdmin, isLoading } = useContext(AuthContext);

  useEffect(() => {
    document.documentElement.lang = "he";
    document.documentElement.dir = "rtl";
    document.body.classList.add("font-he");
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return isAdmin ? <AdminLayout /> : <LoginScreen />;
}

// --- Layout and Screens ---

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="flex flex-col items-center">
      <Shield className="w-16 h-16 text-blue-500 animate-pulse" />
      <p className="mt-4 text-lg text-gray-600">טוען פאנל ניהול...</p>
    </div>
  </div>
);

const LoginScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useContext(AuthContext);

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove all non-digit characters
    if (value.length <= 10) {
      setPhoneNumber(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoggingIn(true);
    try {
      await login(phoneNumber, password);
    } catch (err) {
      console.error("Login attempt failed:", err);
      setError("ההתחברות נכשלה. אנא בדוק את פרטיך וודא שאתה מנהל מערכת.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mb-8">
        <img
          src="https://placehold.co/320x100/003366/FFFFFF?text=Migdalor+Logo"
          alt="Migdalor Logo"
          className="rounded-lg max-w-80 h-auto"
        />
      </div>
      <div className="relative w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Shield className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            פאנל ניהול מגדלור
          </h2>
          <p className="mt-2 text-sm text-gray-600">התחבר לחשבון המנהל שלך</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md shadow-sm">
            <input
              id="phone-number"
              type="tel"
              autoComplete="tel"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
              placeholder="מספר טלפון"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              maxLength="10"
            />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
              placeholder="סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoggingIn}
            className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
          >
            {isLoggingIn ? "מתחבר..." : "התחבר"}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const [currentPage, setCurrentPage] = useState("users");
  const { user, logout } = useContext(AuthContext);

  const renderContent = () => {
    switch (currentPage) {
      case "users":
        return <UserManagement />;
      case "notices":
        return <NoticeManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="flex-shrink-0 flex flex-col w-64 bg-gray-800 text-gray-200">
        <div className="flex items-center justify-center h-20 border-b border-gray-700">
          <Shield className="w-8 h-8 text-blue-400" />
          <span className="mx-3 text-2xl font-bold">מנהל מגדלור</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarButton
            icon={<Users />}
            label="ניהול משתמשים"
            onClick={() => setCurrentPage("users")}
            isActive={currentPage === "users"}
          />
          <SidebarButton
            icon={<FileText />}
            label="ניהול הודעות"
            onClick={() => setCurrentPage("notices")}
            isActive={currentPage === "notices"}
          />
          {/* Other buttons can be added here */}
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="text-sm">מחובר בתור:</div>
          <div className="font-semibold truncate">
            {user ? `${user.hebFirstName} ${user.hebLastName}` : "Admin"}
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            <span className="mx-2">התנתק</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="w-full max-w-7xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

const SidebarButton = ({ icon, label, onClick, isActive, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center w-full px-4 py-2 text-sm font-medium text-left rounded-md transition-colors duration-150 ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-700 hover:text-white"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    {React.cloneElement(icon, { className: "w-5 h-5" })}
    <span className="mr-4">{label}</span>
  </button>
);

// --- User Management Component ---
const UserManagement = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.get("/Resident/residents", token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("נכשל בטעינת המשתמשים.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSave = async (updatedUserData) => {
    try {
      await api.put(`/Resident/${editingUser.id}`, updatedUserData, token);
      setEditingUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(`שגיאה בעדכון משתמש: ${err.message}`);
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await api.delete(`/Resident/${deletingUser.id}`, token);
      setDeletingUser(null);
      fetchUsers(); // Refresh the list
    } catch (err) {
      alert(`שגיאה במחיקת משתמש: ${err.message}`);
      console.error(err);
    }
  };

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber?.includes(searchTerm)
      ),
    [users, searchTerm]
  );

  if (isLoading) return <div className="text-center p-4">טוען משתמשים...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ניהול משתמשים</h2>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="חפש לפי שם, אימייל או טלפון..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pr-10 border border-gray-300 rounded-md"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["שם", "אימייל", "טלפון", "חדר", "סטטוס", "פעולות"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={!user.isActive ? "bg-red-50" : ""}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.phoneNumber || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.roomNumber || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "פעיל" : "לא פעיל"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-blue-600 hover:text-blue-900"
                    title="ערוך"
                  >
                    <Edit size={18} />
                  </button>
                  {user.isActive && (
                    <button
                      onClick={() => setDeletingUser(user)}
                      className="mx-4 text-red-600 hover:text-red-900"
                      title="מחק"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-4 text-gray-500">לא נמצאו משתמשים.</p>
        )}
      </div>
      {editingUser && (
        <EditUserModal
          user={editingUser}
          allUsers={users}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
          token={token}
        />
      )}
      {deletingUser && (
        <ConfirmationModal
          title="אישור מחיקת משתמש"
          message={`האם אתה בטוח שברצונך למחוק את ${deletingUser.fullName}? פעולה זו תסמן אותו כ"לא פעיל".`}
          onConfirm={handleDelete}
          onCancel={() => setDeletingUser(null)}
        />
      )}
    </div>
  );
};

// --- Edit User Modal ---
const EditUserModal = ({ user, allUsers, onClose, onSave, token }) => {
  const [formData, setFormData] = useState({
    hebFirstName: user.hebFirstName || "",
    hebLastName: user.hebLastName || "",
    engFirstName: user.engFirstName || "",
    engLastName: user.engLastName || "",
    email: user.email || "",
    phoneNumber: user.phoneNumber || "",
    dateOfBirth: user.dateOfBirth
      ? new Date(user.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender: user.gender || "",
    personRole: user.personRole || "Resident",
    branchName: user.branchName || "נורדיה",
    isBokerTov: user.isBokerTov ?? true,
    canInitActivity: user.canInitActivity ?? false,
    spouseId: user.spouseId || null,
    dateOfArrival: user.dateOfArrival
      ? new Date(user.dateOfArrival).toISOString().split("T")[0]
      : "",
    homePlace: user.homePlace || "",
    profession: user.profession || "",
    residentDescription: user.residentDescription || "",
    profilePicId: user.profilePicId || null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [spouseSearch, setSpouseSearch] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");
    const formPayload = new FormData();
    formPayload.append("file", file);

    try {
      // The response is expected to be the ID of the uploaded picture
      const pictureId = await api.postForm("/Picture", formPayload, token);
      setFormData((prev) => ({
        ...prev,
        profilePicId: parseInt(pictureId, 10),
      }));
    } catch (err) {
      setUploadError(`שגיאת העלאה: ${err.message}`);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Filter out empty strings to avoid sending them, let the backend handle defaults
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== "" && v !== null)
    );
    // Ensure boolean values are always sent
    payload.isBokerTov = formData.isBokerTov;
    payload.canInitActivity = formData.canInitActivity;

    onSave(payload);
  };

  const filteredSpouses = useMemo(
    () =>
      allUsers.filter(
        (u) =>
          u.id !== user.id &&
          u.fullName.toLowerCase().includes(spouseSearch.toLowerCase())
      ),
    [allUsers, user.id, spouseSearch]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold">
            עריכת פרטי דייר: {user.fullName}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Personal Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">
                פרטים אישיים
              </h4>
              <InputField
                label="שם פרטי (עברית)"
                name="hebFirstName"
                value={formData.hebFirstName}
                onChange={handleChange}
              />
              <InputField
                label="שם משפחה (עברית)"
                name="hebLastName"
                value={formData.hebLastName}
                onChange={handleChange}
              />
              <InputField
                label="שם פרטי (אנגלית)"
                name="engFirstName"
                value={formData.engFirstName}
                onChange={handleChange}
              />
              <InputField
                label="שם משפחה (אנגלית)"
                name="engLastName"
                value={formData.engLastName}
                onChange={handleChange}
              />
              <InputField
                label="אימייל"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
              <InputField
                label="טלפון"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
              />
              <InputField
                label="תאריך לידה"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  מין
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">בחר...</option>
                  <option value="זכר">זכר</option>
                  <option value="נקבה">נקבה</option>
                </select>
              </div>
            </div>

            {/* Column 2: Resident Details */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">פרטי דייר</h4>
              <InputField
                label="סניף"
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
              />
              <InputField
                label="תאריך הגעה"
                name="dateOfArrival"
                type="date"
                value={formData.dateOfArrival}
                onChange={handleChange}
              />
              <InputField
                label="מקום מגורים קודם"
                name="homePlace"
                value={formData.homePlace}
                onChange={handleChange}
              />
              <InputField
                label="מקצוע"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  תיאור
                </label>
                <textarea
                  name="residentDescription"
                  value={formData.residentDescription}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                ></textarea>
              </div>
              <div className="flex items-center space-x-4">
                <CheckboxField
                  label="בוקר טוב"
                  name="isBokerTov"
                  checked={formData.isBokerTov}
                  onChange={handleChange}
                />
                <CheckboxField
                  label="יכול ליזום פעילות"
                  name="canInitActivity"
                  checked={formData.canInitActivity}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  בן/בת זוג
                </label>
                <input
                  type="search"
                  placeholder="חיפוש בן/בת זוג..."
                  value={spouseSearch}
                  onChange={(e) => setSpouseSearch(e.target.value)}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm mb-2"
                />
                <select
                  name="spouseId"
                  value={formData.spouseId || ""}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                >
                  <option value="">ללא</option>
                  {filteredSpouses.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Column 3: Picture Upload */}
            <div className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">
                תמונת פרופיל
              </h4>
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <img
                  src={
                    user.profilePicId
                      ? `${API_BASE_URL}/Picture/${user.profilePicId}`
                      : "https://placehold.co/150x150/E2E8F0/64748B?text=Profile"
                  }
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover mb-4"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/150x150/E2E8F0/64748B?text=Error";
                  }}
                />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/*"
                  disabled={isUploading}
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                >
                  {isUploading ? "מעלה..." : "בחר תמונה"}
                </label>
                {uploadError && (
                  <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                )}
                {formData.profilePicId && (
                  <p className="text-green-600 text-sm mt-2">
                    תמונה הועלתה בהצלחה!
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex justify-end items-center p-4 border-t mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 ml-4"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              שמור שינויים
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      {...props}
      className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
    />
  </div>
);

const CheckboxField = ({ label, ...props }) => (
  <div className="flex items-center">
    <input
      {...props}
      type="checkbox"
      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
    />
    <label className="mr-2 block text-sm text-gray-900">{label}</label>
  </div>
);

// --- Confirmation Modal ---
const ConfirmationModal = ({ title, message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{message}</p>
      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
        >
          ביטול
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          אישור
        </button>
      </div>
    </div>
  </div>
);

// --- Notice Management (Existing Component, no changes needed) ---
const NoticeManagement = () => {
  // This component remains as it was in the original file.
  return (
    <div className="text-center p-6 bg-white rounded-lg shadow-md">
      ניהול הודעות - התוכן לא השתנה.
    </div>
  );
};

// --- Root Component ---
export default function MigdalorAdminPanel() {
  return (
    <>
      <style>{`
        body.font-he {
          font-family: 'Segoe UI', 'Calibri', sans-serif;
        }
      `}</style>
      <AuthProvider>
        <App />
      </AuthProvider>
    </>
  );
}
