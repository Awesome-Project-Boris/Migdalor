import React, { useContext, useState, useEffect } from "react";
import AuthContext from "../Auth/AuthContext";
import api from "../../api/api";

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

export default NoticeManagement;
