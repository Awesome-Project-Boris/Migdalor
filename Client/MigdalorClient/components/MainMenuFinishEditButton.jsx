import { useMainMenuEdit } from "@/context/MainMenuEditProvider";
import FlipButton from "./FlipButton";
import { Text, StyleSheet } from "react-native";

export function EditToggleButton() {
  const { editing, setEditing } = useMainMenuEdit();

  if (!editing) {
    return null;
  }

  return (
    <FlipButton
      text="כניסה"
      bgColor="#f0f0f0"
      textColor="#000000"
      onPress={() => setEditing((prev) => !prev)}
      style={styles.toggleButton}
      flipborderwidth={1}
    >
      <Text style={styles.toggleButtonText}>סיימתי</Text>
    </FlipButton>
  );
}

const styles = StyleSheet.create({
  toggleButton: {
    width: 300,
    height: 70,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: "center",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
  },
  toggleButtonText: {
    color: "#000000",
    fontSize: 24,
  },
});

export default EditToggleButton;
