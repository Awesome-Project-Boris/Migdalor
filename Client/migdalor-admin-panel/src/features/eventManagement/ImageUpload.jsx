import React, { useState, useEffect } from "react";
import { UploadCloud, Sparkles, Check, X } from "lucide-react";
import { api } from "../../api/apiService";

// Helper function to convert a base64 string to a File object
const base64ToFile = (base64, filename) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const ImageUpload = ({
  token,
  eventName,
  eventDescription,
  onImageUploadSuccess,
  existingImage,
}) => {
  const [prompt, setPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState(null); // Will hold the base64 string
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    // Set the initial preview if an existing image is provided
    if (existingImage) {
      // FIX: Prepend the API_BASE_URL to the existing image path
      setPreview(`${api.API_BASE_URL.substring(0, api.API_BASE_URL.length - 4)}${existingImage}`);
    }
    // Update the prompt whenever the event name or description changes
    const defaultPrompt = `${eventName || ""}: ${
      eventDescription || ""
    }`.trim();
    setPrompt(defaultPrompt || "A vibrant community event");
  }, [eventName, eventDescription, existingImage]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGeneratedImage(null); // Clear any generated image
      setPreview(URL.createObjectURL(file));
      handleUpload(file);
    }
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);
    try {
      // FIX: Add "without any text" to the prompt
      const finalPrompt = `${prompt}, without any text`;
      const response = await api.post(
        "/gemini/generate-image",
        { prompt: finalPrompt },
        token
      );
      if (response.images && response.images.length > 0) {
        const imageBase64 = `data:image/png;base64,${response.images[0]}`;
        setGeneratedImage(imageBase64);
        setPreview(imageBase64);
      } else {
        setError("לא התקבלה תמונה מהשרת.");
      }
    } catch (err) {
      setError(`שגיאה ביצירת התמונה: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptGeneratedImage = () => {
    if (generatedImage) {
      const uniqueFilename = `${crypto.randomUUID()}-${Date.now()}.png`;
      const file = base64ToFile(generatedImage, uniqueFilename);
      handleUpload(file);
      setGeneratedImage(null); // Clear the generated image state after accepting
    }
  };

  const handleUpload = async (fileToUpload) => {
    const formData = new FormData();
    formData.append("file", fileToUpload);

    try {
      const picId = await api.postFormData(
        "/picture/UploadAdmin",
        formData,
        token
      );
      onImageUploadSuccess(picId);
    } catch (err) {
      setError(`שגיאה בהעלאת התמונה: ${err.message}`);
    }
  };

  return (
    <div className="p-4 border rounded-md bg-gray-50 space-y-4" dir="rtl">
      <label className="block text-sm font-medium text-gray-700 text-right">
        תמונת אירוע
      </label>

      {/* Image Preview */}
      {preview && (
        <div className="relative w-full h-48 bg-gray-200 rounded-md overflow-hidden">
          {/* FIX: Change object-cover to object-contain to show the full image */}
          <img
            src={preview}
            alt="תצוגה מקדימה"
            className="w-full h-full object-contain"
          />
          {generatedImage && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center space-x-4 space-x-reverse">
              <button
                type="button"
                onClick={handleAcceptGeneratedImage}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
              >
                <Check size={24} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setGeneratedImage(null);
                  setPreview(null);
                }}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <X size={24} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {!generatedImage && (
        <div className="relative">
          <input
            type="file"
            id="file-upload"
            className="absolute w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
            accept="image/*"
          />
          <label
            htmlFor="file-upload"
            className="flex items-center justify-center w-full px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 cursor-pointer"
          >
            <UploadCloud size={20} className="ml-2" />
            העלאת תמונה
          </label>
        </div>
      )}

      {/* AI Generation Section */}
      {!generatedImage && (
        <div className="space-y-2">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="הזן הנחיה ליצירת תמונה..."
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
            rows="2"
          />
          <button
            type="button"
            onClick={handleGenerateImage}
            disabled={isGenerating}
            className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
          >
            {isGenerating ? (
              "יוצר תמונה..."
            ) : (
              <>
                <Sparkles size={20} className="ml-2" />
                צור תמונה עם AI
              </>
            )}
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default ImageUpload;
