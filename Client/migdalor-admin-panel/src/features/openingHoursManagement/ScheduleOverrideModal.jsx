// src/features/openingHoursManagement/ScheduleOverrideModal.jsx
import React, { useState, useEffect } from "react";

const ScheduleOverrideModal = ({ mode, override, services, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        serviceId: '',
        overrideDate: '',
        isOpen: true,
        openTime: '',
        closeTime: '',
        notes: ''
    });

    useEffect(() => {
        if (mode === 'edit' && override) {
            setFormData({
                ...override,
                overrideDate: new Date(override.overrideDate).toISOString().split('T')[0], // Format for date input
            });
        } else {
            // Default for 'add' mode
            setFormData({
                serviceId: services.length > 0 ? services[0].serviceID : '',
                overrideDate: new Date().toISOString().split('T')[0],
                isOpen: true,
                openTime: '09:00',
                closeTime: '17:00',
                notes: ''
            });
        }
    }, [mode, override, services]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure time is null if closed
        const finalData = {
            ...formData,
            serviceId: parseInt(formData.serviceId), // Ensure serviceId is a number
            openTime: formData.isOpen ? formData.openTime : null,
            closeTime: formData.isOpen ? formData.closeTime : null,
        };
        onSave(finalData);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" dir="rtl">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">{mode === 'edit' ? 'עריכת חריגה' : 'הוספת חריגה חדשה'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">שירות</label>
                        <select name="serviceId" value={formData.serviceId} onChange={handleChange} className="w-full p-2 border rounded">
                            {services.map(s => <option key={s.serviceID} value={s.serviceID}>{s.hebrewName}</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">תאריך</label>
                        <input type="date" name="overrideDate" value={formData.overrideDate} onChange={handleChange} className="w-full p-2 border rounded" />
                    </div>
                     <div className="mb-4 flex items-center">
                        <input type="checkbox" id="isOpen" name="isOpen" checked={formData.isOpen} onChange={handleChange} className="ml-2 h-5 w-5"/>
                        <label htmlFor="isOpen" className="text-gray-700">האם השירות פתוח?</label>
                    </div>
                    {formData.isOpen && (
                        <>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">שעת פתיחה</label>
                                <input type="time" name="openTime" value={formData.openTime} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2">שעת סגירה</label>
                                <input type="time" name="closeTime" value={formData.closeTime} onChange={handleChange} className="w-full p-2 border rounded" />
                            </div>
                        </>
                    )}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">הערות</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full p-2 border rounded" rows="3"></textarea>
                    </div>
                    <div className="flex justify-end space-x-4 space-x-reverse">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">ביטול</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">שמירה</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleOverrideModal;