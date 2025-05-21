import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
} from 'react-native';
import * as Print from 'expo-print'; // for PDF export
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Constants from 'expo-constants';
import { Platform } from 'react-native';


const CheckoutHistoryScreen = ({ route }) => {
  const { historyData } = route.params;
  const [filteredData, setFilteredData] = useState(historyData);
  const [searchRoom, setSearchRoom] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilter = () => {
    const filtered = historyData.filter((item) => {
      const matchesRoom = searchRoom
        ? item.number?.toString().includes(searchRoom)
        : true;
      const itemStartDate = new Date(item.startdate);
      const isInRange =
        (!startDate || itemStartDate >= new Date(startDate)) &&
        (!endDate || itemStartDate <= new Date(endDate));
      return matchesRoom && isInRange;
    });
    setFilteredData(filtered);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.header}>Room #{item.number} - {item.type}</Text>
      <Text>👤 {item.membername}</Text>
      <Text>📞 {item.memberphone}</Text>
      <Text>🏠 {item.memberaddress}</Text>
      <Text>🧑‍🤝‍🧑 Adults: {item.adultscount}, Kids: {item.kidscount}</Text>
      <Text>📅 {new Date(item.startdate).toLocaleDateString()} ➡ {new Date(item.enddate).toLocaleDateString()}</Text>
      <Text>💳 {item.modeofpayment}</Text>
      <Text>💰 Price: ₹{item.price}</Text>
      <Text>📝 Purpose: {item.visitpurpose}</Text>
    </View>
  );

// const generatePDF = async () => {
//   const htmlContent = `
//     <h1>Checkout History</h1>
//     ${filteredData
//       .map(
//         (item) => `
//         <div style="margin-bottom:16px;">
//           <strong>Room #${item.number} (${item.type})</strong><br/>
//           Name: ${item.membername || 'N/A'} <br/>
//           Phone: ${item.memberphone || 'N/A'} <br/>
//           Address: ${item.memberaddress || 'N/A'} <br/>
//           Guests: ${item.adultscount || 0} Adults, ${item.kidscount || 0} Kids <br/>
//           Dates: ${new Date(item.startdate).toLocaleDateString()} ➡ ${new Date(item.enddate).toLocaleDateString()} <br/>
//           Purpose: ${item.visitpurpose || 'N/A'} <br/>
//           Payment: ${item.modeofpayment || 'N/A'} <br/>
//           Price: ₹${item.price || 0} <br/>
//         </div>
//       `
//       )
//       .join('')}
//   `;

//   try {
//     const { uri } = await Print.printToFileAsync({ html: htmlContent });
//     const fileName = `Checkout_History_${Date.now()}.pdf`;
//     const newPath = FileSystem.documentDirectory + fileName;


//     await FileSystem.copyAsync({
//       from: uri,
//       to: newPath,
//     });

//     const fileInfo = await FileSystem.getInfoAsync(newPath);
//     if (!fileInfo.exists) throw new Error('PDF file does not exist');


//     const fileUri = newPath.startsWith('file://') ? newPath : 'file://' + newPath;

//     // 🚫 Skip saving to MediaLibrary if running in Expo Go
//     if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
//       console.log('Running in Expo Go — skipping MediaLibrary, sharing file only');
//       await Sharing.shareAsync(fileUri);
//       return;
//     }

//     // ✅ Only run this in standalone builds
//     const { status } = await MediaLibrary.requestPermissionsAsync();
//     if (status !== 'granted') {
//       alert('Permission to access media library is required!');
//       return;
//     }

//     const asset = await MediaLibrary.createAssetAsync(fileUri);
//     await MediaLibrary.createAlbumAsync('CheckoutHistory', asset, false);

//     alert('✅ PDF saved to device in "CheckoutHistory" album');

//     await Sharing.shareAsync(fileUri);
//   } catch (error) {
//     console.error('Error exporting PDF:', error);
//     alert('❌ Failed to generate or share PDF');
//   }
// };
const generatePDF = async () => {
  const htmlContent = `
    <html>
      <head>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            font-family: Arial, sans-serif;
          }
          th, td {
            border: 1px solid #dddddd;
            padding: 8px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #f2f2f2;
          }
          h1 {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>Checkout History</h1>
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Type</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Guests</th>
              <th>Dates</th>
              <th>Purpose</th>
              <th>Payment</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(item => `
              <tr>
                <td>${item.number || '-'}</td>
                <td>${item.type || '-'}</td>
                <td>${item.membername || '-'}</td>
                <td>${item.memberphone || '-'}</td>
                <td>${item.memberaddress || '-'}</td>
                <td>${item.adultscount || 0}A / ${item.kidscount || 0}K</td>
                <td>${new Date(item.startdate).toLocaleDateString()} ➡ ${new Date(item.enddate).toLocaleDateString()}</td>
                <td>${item.visitpurpose || '-'}</td>
                <td>${item.modeofpayment || '-'}</td>
                <td>₹${item.price || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    const fileName = `Checkout_History_${Date.now()}.pdf`;

    if (Platform.OS === 'android') {
      // Save to Downloads using SAF
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      if (!permissions.granted) {
        alert('❌ Permission not granted to access storage');
        return;
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'application/pdf'
      );

      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      alert(' PDF successfully saved to Downloads');
    } else {
      // For iOS only: share the file
      await Sharing.shareAsync(uri);
    }
  } catch (error) {
    console.error('Error exporting PDF:', error);
    alert(' Failed to generate or save PDF');
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout History</Text>

      {/* Filter Section */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.input}
          placeholder="Filter by room number"
          value={searchRoom}
          onChangeText={setSearchRoom}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Start Date (YYYY-MM-DD)"
          value={startDate}
          onChangeText={setStartDate}
        />
        <TextInput
          style={styles.input}
          placeholder="End Date (YYYY-MM-DD)"
          value={endDate}
          onChangeText={setEndDate}
        />
        <Button title="Apply Filter" onPress={handleFilter} />
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
        <Text style={styles.pdfText}>📄 Export to PDF</Text>
      </TouchableOpacity>
    </View>
  );
};

export default CheckoutHistoryScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  card: {
    backgroundColor: '#e6f0ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  header: { fontWeight: 'bold', marginBottom: 8 },
  filterContainer: { marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    padding: 8,
    borderRadius: 5,
  },
  pdfButton: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  pdfText: { color: '#fff', fontWeight: 'bold' },
});
