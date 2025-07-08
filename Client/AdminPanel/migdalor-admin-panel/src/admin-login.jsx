import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useCallback,
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
} from "lucide-react";

// --- Configuration ---
const API_BASE_URL = "http://192.168.0.160:44315/api";

// --- API Service ---
const api = {
  async get(endpoint, token) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (response.status === 401) {
      throw new Error("Unauthorized");
    }
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (
      response.headers.get("content-length") === "0" ||
      response.status === 204
    ) {
      return null;
    }
    return response.json();
  },

  async post(endpoint, body, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData || `HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return response.json();
    } else {
      return response.text();
    }
  },

  async put(endpoint, body, token) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (
      response.headers.get("content-length") === "0" ||
      response.status === 204
    ) {
      return null;
    }
    return response.json();
  },

  async delete(endpoint, token) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    if (
      response.headers.get("content-length") === "0" ||
      response.status === 204
    ) {
      return null;
    }
    return response.json();
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

  const login = async (email, password) => {
    try {
      setIsLoading(true);
      const response = await api.post("/People/login", { email, password });
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

  if (!isAdmin) {
    return <LoginScreen />;
  }

  return <AdminLayout />;
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
      // The backend uses the 'email' field for the phone number as well
      await login(phoneNumber, password);
    } catch {
      setError("ההתחברות נכשלה. אנא בדוק את פרטיך וודא שאתה מנהל מערכת.");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="mb-8">
        <img
          src="./src/assets/migdalei.png"
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
            <div>
              <input
                id="phone-number"
                name="phone"
                type="tel"
                autoComplete="tel"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
                placeholder="מספר טלפון"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                maxLength="10"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-right"
                placeholder="סיסמה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md group hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {isLoggingIn ? "מתחבר..." : "התחבר"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminLayout = () => {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const { user, logout } = useContext(AuthContext);

  const renderContent = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard navigate={setCurrentPage} />;
      case "users":
        return <UserManagement />;
      case "notices":
        return <NoticeManagement />;
      default:
        return <Dashboard navigate={setCurrentPage} />;
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
            icon={<Users className="w-5 h-5" />}
            label="ניהול משתמשים"
            onClick={() => setCurrentPage("users")}
            isActive={currentPage === "users"}
          />
          <SidebarButton
            icon={<FileText className="w-5 h-5" />}
            label="ניהול הודעות"
            onClick={() => setCurrentPage("notices")}
            isActive={currentPage === "notices"}
          />
          <SidebarButton
            icon={<Activity className="w-5 h-5" />}
            label="פעילויות"
            disabled
          />
          <SidebarButton
            icon={<ShoppingCart className="w-5 h-5" />}
            label="שוק"
            disabled
          />
          <SidebarButton
            icon={<Bell className="w-5 h-5" />}
            label="התראות"
            disabled
          />
          <SidebarButton
            icon={<Settings className="w-5 h-5" />}
            label="הגדרות מערכת"
            disabled
          />
        </nav>
        <div className="px-4 py-4 border-t border-gray-700">
          <div className="mt-4">
            <div className="text-sm">מחובר בתור:</div>
            <div className="font-semibold truncate">
              {user?.fullName || "Admin"}
            </div>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-end items-center p-4 bg-white border-b border-gray-200 shadow-sm">
          {/* Placeholder for potential header content */}
        </header>
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="w-full max-w-7xl mx-auto">
            {currentPage !== "dashboard" && (
              <button
                onClick={() => setCurrentPage("dashboard")}
                className="text-gray-500 hover:text-gray-800 mb-4 inline-flex items-center"
                title="חזרה ללוח המחוונים"
              >
                <span className="ml-2">&rarr;</span>
                חזרה ללוח המחוונים
              </button>
            )}
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarButton = ({ icon, label, onClick, isActive, disabled }) => {
  const marginClass = "mr-4";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center w-full px-4 py-2 text-sm font-medium text-left rounded-md transition-colors duration-150
            ${
              isActive
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-700 hover:text-white"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
    >
      {icon}
      <span className={marginClass}>{label}</span>
    </button>
  );
};

const Dashboard = ({ navigate }) => {
  const adminActions = [
    {
      id: "users",
      title: "ניהול משתמשים",
      description: "הוסף, ערוך ונהל דיירים וצוות.",
      icon: <Users size={24} />,
      enabled: true,
    },
    {
      id: "notices",
      title: "ניהול הודעות",
      description: "צור, פרסם והעבר לארכיון הודעות.",
      icon: <FileText size={24} />,
      enabled: true,
    },
    {
      id: "activities",
      title: "לוח פעילויות",
      description: "נהל פעילויות וחוגים בבניין.",
      icon: <Activity size={24} />,
      enabled: false,
    },
    {
      id: "marketplace",
      title: "בקרת שוק",
      description: "פקח ונהל מודעות בשוק.",
      icon: <ShoppingCart size={24} />,
      enabled: false,
    },
    {
      id: "notifications",
      title: "שלח התראות",
      description: "שלח התראות לכל המשתמשים או לקבוצות.",
      icon: <Bell size={24} />,
      enabled: false,
    },
    {
      id: "settings",
      title: "הגדרות מערכת",
      description: "הגדר הגדרות כלליות לאפליקציה.",
      icon: <Settings size={24} />,
      enabled: false,
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">לוח מחוונים למנהל</h1>
      <p className="mt-2 text-gray-600">ברוך הבא! בחר פעולה כדי להתחיל.</p>
      <div className="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3">
        {adminActions.map((action) => (
          <button
            key={action.id}
            onClick={() => action.enabled && navigate(action.id)}
            disabled={!action.enabled}
            className={`p-6 text-left bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-200 ${
              !action.enabled
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`p-3 rounded-full ${
                  action.enabled
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {action.icon}
              </div>
              <h3 className="mx-4 text-lg font-semibold text-gray-800">
                {action.title}
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">{action.description}</p>
            {!action.enabled && (
              <span className="text-xs text-red-500 mt-2 block">בקרוב</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const UserManagement = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await api.get("/Resident/residents", token);
        setUsers(data || []);
      } catch (err) {
        setError("נכשל בטעינת המשתמשים.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  if (isLoading) return <div className="text-center p-4">טוען משתמשים...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ניהול משתמשים</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                שם
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                אימייל
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                טלפון
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                חדר
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {user.fullName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {user.phoneNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {user.roomNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button className="text-blue-600 hover:text-blue-900">
                    ערוך
                  </button>
                  <button className="mx-4 text-red-600 hover:text-red-900">
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="text-center py-4 text-gray-500">לא נמצאו משתמשים.</p>
        )}
      </div>
    </div>
  );
};

const NoticeManagement = () => {
  const { token } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setIsLoading(true);
        const data = await api.get("/Notices", token);
        setNotices(data || []);
      } catch (err) {
        setError("נכשל בטעינת ההודעות.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotices();
  }, [token]);

  const handleDelete = async (id) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק הודעה זו?")) {
      try {
        await api.delete(`/Notices/${id}`, token);
        setNotices(notices.filter((n) => n.id !== id));
      } catch (err) {
        alert("מחיקת ההודעה נכשלה.");
        console.error(err);
      }
    }
  };

  if (isLoading) return <div className="text-center p-4">טוען הודעות...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ניהול הודעות</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                כותרת
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                תוכן
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                תאריך
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                פעולות
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {notices.map((notice) => (
              <tr key={notice.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {notice.title}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-sm truncate text-right">
                  {notice.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                  {new Date(notice.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                  <button className="text-blue-600 hover:text-blue-900">
                    ערוך
                  </button>
                  <button
                    onClick={() => handleDelete(notice.id)}
                    className="mx-4 text-red-600 hover:text-red-900"
                  >
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {notices.length === 0 && (
          <p className="text-center py-4 text-gray-500">לא נמצאו הודעות.</p>
        )}
      </div>
    </div>
  );
};

// --- Root Component ---
export default function MigdalorAdminPanel() {
  return (
    <>
      <style>{`
        body.font-he {
          font-family: Calibri, sans-serif;
        }
      `}</style>
      <AuthProvider>
        <App />
      </AuthProvider>
    </>
  );
}
