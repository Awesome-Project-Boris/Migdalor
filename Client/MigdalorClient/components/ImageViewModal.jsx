// ImageViewModal.jsx

import { Modal, Image as RNImage, StyleSheet, Dimensions, Text } from 'react-native';
// Import FlipButton
import FlipButton from './FlipButton';
// Import Tamagui components needed (removed Button)
import { XStack, YStack } from 'tamagui';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function ImageViewModal({ visible, imageUri, onClose, onRemove }) {

  if (!visible || !imageUri) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* 1. Backdrop YStack - REMOVED jc="center" ai="center" */}
      <YStack
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        backgroundColor="rgba(0,0,0,0.7)"
        // Removed padding here, apply to inner if needed
      >
        {/* 2. Inner Content Box YStack - Adjust sizing/positioning for top-left */}
        <YStack
          // Adjust width/height/margins as needed for top-left positioning
          width="95%" // Keep it slightly less than full width
          maxWidth={500}
          maxHeight="90%"
          backgroundColor="white" // Or $background token
          borderRadius={10} // Or $4/$6 token
          p="$4"
          space="$4"
          position="absolute" // Position it explicitly
          top={20} // Example: Add some top margin
          left={10} // Example: Add some left margin
          // If you want strict top-left corner: top={0}, left={0}, width='100%', etc.
          overflow="hidden"
        >
          {/* 3. Image Container YStack */}
          <YStack
            flexShrink={1}
            jc="center"
            ai="center"
            borderColor="lightgrey" // Or $borderColor
            borderWidth={1}
            borderRadius={8} // Or $4
            overflow="hidden"
            aspectRatio={1} // Keeps it square, adjust/remove if needed
            width="100%"
          >
            {/* 4. Use RN Image */}
            <RNImage
              source={{ uri: imageUri }}
              style={{ width: '100%', height: '100%'}}
              resizeMode="contain"
            />
          </YStack>

          {/* 5. Button Container XStack - Now using FlipButton */}
          <XStack jc="space-around" space={10} /* Or $3 */ ai="center" >
             {/* Use FlipButton, apply flex style */}
             <FlipButton
                text="Remove"
                onPress={onRemove}
                bgColor="#ffffff" // Example styling
                textColor="#000000" // Example styling
                style={{ flexGrow: 1, marginHorizontal: 5 }} // Use style prop for flex/margin
             />
             <FlipButton
                text="Return"
                onPress={onClose}
                bgColor="#ffffff" // Example styling
                textColor="#000000" // Example styling
                style={{ flexGrow: 1, marginHorizontal: 5 }} // Use style prop for flex/margin
             />
          </XStack>
        </YStack>
      </YStack>
    </Modal>
  );
}

export default ImageViewModal;

// Add StyleSheet if you need it elsewhere, otherwise can remove if only inline styles used now
// const styles = StyleSheet.create({ ... });