import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export default function AppProvider({ children }) {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);  // store role in context

    return (
        <AppContext.Provider value={{ user, setUser, role, setRole }}>
            {children}
        </AppContext.Provider>
    );
}
