import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomToastProps {
  text1?: string;
  text2?: string;
}

export const CustomSuccessToast: React.FC<CustomToastProps> = ({ text1, text2 }) => (
  // --- 3. Fix Duplicate Style Prop ---
  <View style={[styles.toastBase, styles.successToast]}>
   <Ionicons name="checkmark-circle" size={24} color="white" style={styles.toastIcon} /> 
    <View style={styles.toastTextContainer}>
      {text1 && <Text style={[styles.toastText, styles.toastTitle]}>{text1}</Text>}
      {text2 && <Text style={[styles.toastText, styles.toastMessage]}>{text2}</Text>}
    </View>
  </View>
);

// --- 2. Apply Type Annotation to Component Props ---
export const CustomErrorToast: React.FC<CustomToastProps> = ({ text1, text2 }) => (
  // Assuming the same duplicate style error might have been here too, apply fix if needed
  <View style={[styles.toastBase, styles.errorToast]}>
    <Ionicons name="alert-circle" size={24} color="white" style={styles.toastIcon} /> 
    <View style={styles.toastTextContainer}>
      {text1 && <Text style={[styles.toastText, styles.toastTitle]}>{text1}</Text>}
      {text2 && <Text style={[styles.toastText, styles.toastMessage]}>{text2}</Text>}
    </View>
  </View>
);

export const toastConfig = {
  success: (props: CustomToastProps) => <CustomSuccessToast {...props} />,
  error: (props: CustomToastProps) => <CustomErrorToast {...props} />,
  // Add info, warning etc. if needed, ensuring 'props' is typed for each
};
  
  // --- Add Styles for your custom toasts ---
  const styles = StyleSheet.create({
    toastBase: {
      flexDirection: 'row',
      width: '90%', // Example: control overall width
      maxWidth: 400,
      paddingVertical: 15, // Example: control vertical size
      paddingHorizontal: 20, // Example: control horizontal size
      borderRadius: 8,
      marginVertical: 5,
      alignItems: 'center',
      // Add shadow or other base styles if desired
    },
    successToast: {
      backgroundColor: '#4CAF50', // Green for success
    },
    errorToast: {
      backgroundColor: '#D32F2F', // Red for error
    },
    toastIcon: {
        marginRight: 15,
    },
    toastTextContainer: {
        flex: 1, // Allow text to take remaining space
    },
    toastText: {
      color: 'white',
    },
    toastTitle: {
      fontSize: 28, // Larger font size for title
      fontWeight: 'bold',
      marginBottom: 3, // Space between title and message
    },
    toastMessage: {
      fontSize: 24, // Slightly smaller font size for message
    },
  });
