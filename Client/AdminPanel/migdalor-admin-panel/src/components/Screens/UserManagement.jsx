import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../Auth/AuthContext";
import api from "../../api/api";

const UserManagement = () => {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const data = await api.get("/People", token);
        setUsers(data || []);
      } catch (err) {
        setError("נכשל בטעינת המשתמשים.");
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

export default UserManagement;
