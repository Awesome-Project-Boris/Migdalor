import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';


// Depends on how date acutally looks, could be ISO, could be Date, could be DateTime - CHANGE IF NEEDED. Maybe we'll also want the time?
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    // If input is "YYYY-MM-DD"
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; 
  }
};

// Helper function to create a snippet 
const createSnippet = (message, maxLength = 100) => {
    if (!message) return '';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
}

// NoticeCard component expects 'data' and 'onPress' props
function NoticeCard({ data, onPress }) {
  if (!data) {
    return null; 
  }

  // data will have the notice's data

  const displayDate = formatDate(data.creationDate);
  const displaySnippet = createSnippet(data.noticeMessage); 

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.infoContainer}>
        <Text style={styles.noticeTitle}>{data.noticeTitle}</Text>

        {data.noticeCategory && (
          <Text style={styles.noticeCategory}>
             Category: {data.noticeCategory}
             {data.noticeSubCategory ? ` (${data.noticeSubCategory})` : ''}
           </Text>
        )}

        <Text style={styles.noticeDate}>Date: {displayDate}</Text>

        {displaySnippet && (
             <Text style={styles.noticeSnippet}>{displaySnippet}</Text>
        )}

      </View>

      <View style={styles.moreInfoContainer}>
         <Text style={styles.moreInfoText}>יש ללחוץ לפרטים נוספים</Text>
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 120,
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    borderColor: '#ccc',
    borderWidth: 5,
    position: 'relative',
    paddingBottom: 30,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  noticeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  noticeCategory: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
    fontStyle: 'italic',
  },
  noticeDate: {
      fontSize: 14,
      color: '#555',
      marginBottom: 8,
  },
  noticeSnippet: {
      fontSize: 14,
      color: '#333',
      lineHeight: 18,
  },
   // Optional: Style for sender info
   // senderInfo: {
   //    fontSize: 12,
   //    color: '#888',
   //    marginTop: 5,
   // },
  moreInfoContainer: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  moreInfoText: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default NoticeCard;