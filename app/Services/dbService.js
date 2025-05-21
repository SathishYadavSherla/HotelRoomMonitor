// dbService.js

import * as SQLite from 'expo-sqlite';
import { ROOMS } from '../../constants/mockdata'; // Adjust path as needed
//https://sheetdb.io/api/v1/wqaq7b4sdxq6k
import { View, Text, TextInput, Button, Image, Alert, StyleSheet, TouchableOpacity } from 'react-native';
const SHEET_API = 'https://script.google.com/macros/s/AKfycbzDdbvWCOG28eaNZM2XGXamezROq3qS87WZEpABf0Pf00j6ypjlTFXvlXarTlJkaOOkjQ/exec'; 

const dbService = {
  getRooms: async () => {
  try {
    const response = await fetch(SHEET_API);
    return await response.json();
  } catch (error) {
    console.error('Error fetching ro oms:', error);
    return [];
  }
},

getRoomsByType: async (type) => {
  try {
    const response = await fetch(`${SHEET_API}?type=${type}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching ro om by type:', error);
  }
},

getRoomsByID: async (roomId) => {
  try {
    const response = await fetch(`${SHEET_API}?id=${roomId}`);
    const json = await response.json();
    return json;
  } catch (error) {
    console.error('Error fetching roo m by ID:', error);
  }
},

getHistoryRooms: async () => {
  try {
    const response = await fetch(`${SHEET_API}?history=true`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching history rooms:', error);
    return [];
  }
},



addMemberToRoom: async (
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
  modeOfPayment
) => {
  try {
    const body = {
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
      modeOfPayment
    };
    console.log('request:',body)
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
    console.error('Error posti n g data:', error);
  }
},

updateMemberDetailsOnly: async (
  roomId,
number,type,status,
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
      roomId,number,type,status,
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

    console.log('edited data',body);
    return await response.json();
  } catch (error) {
    console.error('Error updating member details:', error);
  }
}


};

export default dbService;

