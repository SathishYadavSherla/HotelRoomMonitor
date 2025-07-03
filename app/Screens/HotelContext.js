// HotelContext.js
import React, { createContext, useContext, useState } from 'react';

const HotelContext = createContext();

export const useHotel = () => useContext(HotelContext);

export const HotelProvider = ({ children }) => {
    const [hotelName, setHotelName] = useState('');

    return (
        <HotelContext.Provider value={{ hotelName, setHotelName }}>
            {children}
        </HotelContext.Provider>
    );
};
