import React, { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within DataProvider');
    }
    return context;
};

export const DataProvider = ({ children }) => {
    const [uploads, setUploads] = useState(() => {
        try {
            const saved = localStorage.getItem('data_uploads');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error("Failed to parse data_uploads:", e);
            return [];
        }
    });

    const [currentData, setCurrentData] = useState(null);

    useEffect(() => {
        localStorage.setItem('data_uploads', JSON.stringify(uploads));
    }, [uploads]);

    const addUpload = (upload) => {
        const newUpload = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...upload
        };
        setUploads(prev => [newUpload, ...prev]);
        setCurrentData(newUpload);
        return newUpload;
    };

    const deleteUpload = (id) => {
        setUploads(prev => prev.filter(u => u.id !== id));
        if (currentData?.id === id) {
            setCurrentData(null);
        }
    };

    const value = {
        uploads,
        currentData,
        setCurrentData,
        addUpload,
        deleteUpload
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
