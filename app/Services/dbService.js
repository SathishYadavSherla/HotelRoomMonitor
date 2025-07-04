// dbService.js

import * as SQLite from 'expo-sqlite';
import { ROOMS } from '../../constants/mockdata';
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
const SHEET_API = 'https://script.google.com/macros/s/AKfycbykrftbQK30K3pozF2ehB2V2k_PBOw0QILxb1GaNH8eF5ERjXkGYEErJ01qXrriN1yv0Q/exec';

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
      console.error('Error calling SHEET_API:', error);
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
  }
  ,

  getHistoryRooms: async (hotelName) => {
    try {
      const url = `${SHEET_API}?hotelName=${encodeURIComponent(hotelName)}&history=true`;
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
    base64Image
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
        base64Image
      };
      console.log(body);
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
  }


};

export default dbService;

