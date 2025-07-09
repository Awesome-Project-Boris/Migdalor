// /src/features/userManagement/UserManagement.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Search, Edit, Trash2 } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { api } from "../../api/apiService";
import EditUserModal from "./EditUserModal";
import ConfirmationModal from "../../components/common/ConfirmationModal";

/**
 * A component for managing system users. It allows viewing a list of users,
 * searching, editing user details, and deactivating users.
 */
const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Fetches the list of all resident users from the API.
   */
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get("/Resident/residents", token);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("נכשל בטעינת המשתמשים.");
      console.error("Failed to fetch users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  /**
   * Handles saving updated user data via the API.
   * @param {object} updatedUserData - The user data to save.
   */
  const handleSave = async (updatedUserData) => {
    if (!editingUser) return;
    try {
      await api.put(`/Resident/${editingUser.id}`, updatedUserData, token);
      setEditingUser(null);
      fetchUsers(); // Refresh the user list after saving.
    } catch (err) {
      // In a real app, you might use a more robust notification system.
      alert(`שגיאה בעדכון משתמש: ${err.message}`);
      console.error("Failed to save user:", err);
    }
  };

  /**
   * Handles deleting a user (marking as inactive) via the API.
   */
  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      // The API endpoint marks the user as inactive rather than deleting.
      await api.delete(`/Resident/${deletingUser.id}`, token);
      setDeletingUser(null);
      fetchUsers(); // Refresh the user list.
    } catch (err) {
      alert(`שגיאה במחיקת משתמש: ${err.message}`);
      console.error("Failed to delete user:", err);
    }
  };

  // Memoized filtering of users based on the search term.
  const filteredUsers = useMemo(
    () =>
      users.filter(
        (user) =>
          (user.fullName || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (user.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.phoneNumber || "").includes(searchTerm)
      ),
    [users, searchTerm]
  );

  if (isLoading) {
    return <div className="text-center p-4">טוען משתמשים...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">ניהול משתמשים</h2>
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="חפש לפי שם, אימייל או טלפון..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 pr-10 border border-gray-300 rounded-md text-right"
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
        {filteredUsers.length === 0 && !isLoading && (
          <p className="text-center py-4 text-gray-500">לא נמצאו משתמשים.</p>
        )}
      </div>

      {editingUser && (
        <EditUserModal
          user={editingUser}
          allUsers={users}
          onClose={() => setEditingUser(null)}
          onSave={handleSave}
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

export default UserManagement;
