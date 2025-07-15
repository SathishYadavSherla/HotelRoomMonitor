// dbService.js

import * as SQLite from 'expo-sqlite';
import { ROOMS } from '../../constants/mockdata';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
import * as FileSystem from 'expo-file-system';
const SHEET_API = 'https://script.google.com/macros/s/AKfycbxNOUQsRnJCCMpNFVRaWVWihGvulTCv9tZt3Mx2e1WGHP49I9fv72fiEsrPyBS3vUTM5Q/exec';

const dbService = {

  insertNewRoom: async (hotelName, roomData, roomStatus) => {
    try {
      const body = {
        action: 'InsertNewRoom',
        hotelName,
        roomData,
        roomStatus
      };
      const response = await fetch(SHEET_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      return await response.json();
    } catch (error) {
      console.error('Error c alling SHEET_API:', error);
      throw error;
    }
  },
  createSheetsAndSaveCredentials: async (hotelName, username, password) => {
    try {
      const response = await fetch(SHEET_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ hotelName, username, password }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error calling SHEET_API:', error);
      throw error;
    }
  },
  updatePassword: async (hotelName, username, newPassword, password) => {
    try {
      const body = {
        action: 'UpdatePassword',
        hotelName,
        username,
        newPassword,
        password
      };

      const response = await fetch(SHEET_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating password:', error);
      return { success: false, message: 'Server error' };
    }
  },
  getRooms: async (hotelName) => {
    try {
      const url = `${SHEET_API}?hotelName=${encodeURIComponent(hotelName)}`;
      const response = await fetch(url);
      const data = await response.json();

      // Ensure response is an array
      if (Array.isArray(data)) {
        return data;
      } else {
        console.error('Unexpected response format:', data);
        return []; // fallback to empty array
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  },
  getRoomsByType: async (hotelName, type) => {
    try {
      const url = `${SHEET_API}?hotelName=${encodeURIComponent(hotelName)}&type=${encodeURIComponent(type)}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching room by type:', error);
    }
  },
  getRoomsByID: async (hotelName, roomId) => {
    try {
      const url = `${SHEET_API}?hotelName=${encodeURIComponent(hotelName)}&id=${encodeURIComponent(roomId)}`;
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching ro om by ID:', error);
    }
  },
  getHistoryRooms: async (hotelName) => {
    try {
      const url = `${SHEET_API}?hotelName=${encodeURIComponent(hotelName)}&history=true`;
      console.log(url);
      const response = await fetch(url);
      return await response.json();
    } catch (error) {
      console.error('Error fetching history  rooms:', error);
      return [];
    }
  },
  registerHotel: async (hotelName, place, mobile, email, owner) => {
    const payload = {
      action: 'RegisterHotel',
      hotelName,
      place,
      mobile,
      email,
      owner
    };
    const response = await fetch(SHEET_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  },
  uploadImageToDrive: async (uri, fileName, hotelName, captureSide, tenantName) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const response = await fetch(SHEET_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          hotelName,
          tenantName,
          captureSide,
          imageData: base64,
          mimeType: 'image/jpeg',
          action: 'UploadBase64Image',
        }),
      });

      const result = await response.json();
      return result.success ? result.url : null;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  },
  addMemberToRoom: async (
    hotelName,
    roomId,
    number,
    type,
    status,
    memberName,
    memberPhone,
    memberAddress,
    adultsCount,
    kidsCount,
    visitPurpose,
    startDate,
    endDate,
    price,
    modeOfPayment,
    frontImageFileName,
    backImageFileName
  ) => {
    try {
      const body = {
        hotelName,
        roomId,
        number,
        type,
        status,
        memberName,
        memberPhone,
        memberAddress,
        adultsCount,
        kidsCount,
        visitPurpose,
        startDate,
        endDate,
        price,
        modeOfPayment,
        frontImageFileName,
        backImageFileName
      };
      console.log("Body", body);
      const response = await fetch(SHEET_API, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error posting data::', error);
    }
  },
  updateMemberDetailsOnly: async (
    roomId,
    number, type, status,
    memberName,
    memberPhone,
    memberAddress,
    adultsCount,
    kidsCount,
    visitPurpose,
    startDate,
    endDate,
    price,
    modeOfPayment
  ) => {
    try {
      const body = {
        action: 'updateMemberDetails',
        roomId, number, type, status,
        memberName,
        memberPhone,
        memberAddress,
        adultsCount,
        kidsCount,
        visitPurpose,
        startDate,
        endDate,
        price,
        modeOfPayment
      };

      const response = await fetch(SHEET_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      return await response.json();
    } catch (error) {
      console.error('Error updating memb r details:', error);
    }
  },
  moveRoomBooking: async (hotelName, fromRoom, toRoom) => {
    try {
      const body = {
        action: 'MoveBooking',
        hotelName, fromRoom, toRoom
      };
      const response = await fetch(SHEET_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Move  Failed', error);
    }
  }

};

export default dbService;

