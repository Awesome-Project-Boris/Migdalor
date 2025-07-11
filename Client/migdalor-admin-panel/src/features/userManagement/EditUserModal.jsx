import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Grid,
  Box,
  Typography,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  CircularProgress,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import { Close as CloseIcon } from "@mui/icons-material";
import { api } from "../../api/apiService";
import { useAuth } from "../../auth/AuthContext";
import { API_BASE_URL } from "../../config";

// NOTE: For MUI's RTL support to work correctly, you should configure this at the root of your application (e.g., in your App.js or index.js).
// This local setup is for demonstration purposes.
const cacheRtl = createCache({
  key: "muirtl",
  stylisPlugins: [rtlPlugin],
});

const theme = createTheme({
  direction: "rtl",
});

/**
 * A modal form for editing user details, rebuilt with MUI components.
 * @param {object} props
 * @param {object} props.user - The user object being edited.
 * @param {Array} props.allUsers - The list of all users, for spouse selection.
 * @param {Function} props.onClose - Function to call to close the modal.
 * @param {Function} props.onSave - Function to call to save the changes.
 * @param {boolean} [props.open=false] - Controls if the modal is open.
 */
const EditUserModal = ({ user, allUsers, onClose, onSave, open }) => {
  const { token } = useAuth();
  // In a real app, you'd likely use a global Snackbar context instead of managing state here.
  // const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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
    spouseId: user.spouseId || "",
    dateOfArrival: user.dateOfArrival
      ? new Date(user.dateOfArrival).toISOString().split("T")[0]
      : "",
    homePlace: user.homePlace || "",
    profession: user.profession || "",
    residentDescription: user.residentDescription || "",
    profilePicId: user.profilePicId || null,
  });
  const [isUploading, setIsUploading] = useState(false);
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
    const formPayload = new FormData();
    formPayload.append("file", file);

    try {
      const pictureId = await api.postForm("/Picture", formPayload, token);
      setFormData((prev) => ({
        ...prev,
        profilePicId: parseInt(pictureId, 10),
      }));
      // In a real app, you'd call your snackbar context here.
      // setSnackbar({ open: true, message: 'תמונה הועלתה בהצלחה!', severity: 'success' });
    } catch (err) {
      // setSnackbar({ open: true, message: `שגיאת העלאה: ${err.message}`, severity: 'error' });
      console.error("File upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(formData).filter(([_, v]) => v !== "" && v !== null)
    );
    payload.isBokerTov = formData.isBokerTov;
    payload.canInitActivity = formData.canInitActivity;
    payload.spouseId = formData.spouseId ? Number(formData.spouseId) : null;
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

  const profilePicUrl = formData.profilePicId
    ? `${API_BASE_URL}/Picture/${formData.profilePicId}`
    : "";
  const avatarText = `${formData.hebFirstName?.[0] || ""}${
    formData.hebLastName?.[0] || ""
  }`;

  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth dir="rtl">
          <DialogTitle sx={{ m: 0, p: 2 }}>
            עריכת פרטי דייר: {user.fullName}
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: "absolute",
                left: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <Box component="form" id="edit-user-form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Column 1: Personal Details */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    פרטים אישיים
                  </Typography>
                  <TextField
                    fullWidth
                    label="שם פרטי (עברית)"
                    name="hebFirstName"
                    value={formData.hebFirstName}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="שם משפחה (עברית)"
                    name="hebLastName"
                    value={formData.hebLastName}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="שם פרטי (אנגלית)"
                    name="engFirstName"
                    value={formData.engFirstName}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="שם משפחה (אנגלית)"
                    name="engLastName"
                    value={formData.engLastName}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="אימייל"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="טלפון"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="תאריך לידה"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>מין</InputLabel>
                    <Select
                      name="gender"
                      value={formData.gender}
                      label="מין"
                      onChange={handleChange}
                    >
                      <MenuItem value="זכר">זכר</MenuItem>
                      <MenuItem value="נקבה">נקבה</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Column 2: Resident Details */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    פרטי דייר
                  </Typography>
                  <TextField
                    fullWidth
                    label="סניף"
                    name="branchName"
                    value={formData.branchName}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="תאריך הגעה"
                    name="dateOfArrival"
                    type="date"
                    value={formData.dateOfArrival}
                    onChange={handleChange}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    fullWidth
                    label="מקום מגורים קודם"
                    name="homePlace"
                    value={formData.homePlace}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="מקצוע"
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="תיאור"
                    name="residentDescription"
                    multiline
                    rows={3}
                    value={formData.residentDescription}
                    onChange={handleChange}
                    margin="normal"
                  />
                  <Box>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="isBokerTov"
                          checked={formData.isBokerTov}
                          onChange={handleChange}
                        />
                      }
                      label="בוקר טוב"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          name="canInitActivity"
                          checked={formData.canInitActivity}
                          onChange={handleChange}
                        />
                      }
                      label="יכול ליזום פעילות"
                    />
                  </Box>
                  <FormControl fullWidth margin="normal">
                    <TextField
                      fullWidth
                      label="חיפוש בן/בת זוג..."
                      value={spouseSearch}
                      onChange={(e) => setSpouseSearch(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <InputLabel id="spouse-select-label">בן/בת זוג</InputLabel>
                    <Select
                      labelId="spouse-select-label"
                      name="spouseId"
                      value={formData.spouseId}
                      label="בן/בת זוג"
                      onChange={handleChange}
                    >
                      <MenuItem value="">
                        <em>ללא</em>
                      </MenuItem>
                      {filteredSpouses.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.fullName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Column 3: Picture Upload */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    תמונת פרופיל
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      border: "2px dashed grey",
                      borderRadius: 2,
                      textAlign: "center",
                    }}
                  >
                    <Avatar
                      src={profilePicUrl}
                      sx={{ width: 128, height: 128, margin: "auto", mb: 2 }}
                    >
                      {avatarText}
                    </Avatar>
                    <Button
                      variant="contained"
                      component="label"
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <CircularProgress size={24} />
                      ) : (
                        "בחר תמונה"
                      )}
                      <input
                        type="file"
                        hidden
                        onChange={handleFileChange}
                        accept="image/*"
                      />
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>ביטול</Button>
            <Button type="submit" form="edit-user-form" variant="contained">
              שמור שינויים
            </Button>
          </DialogActions>
        </Dialog>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default EditUserModal;
