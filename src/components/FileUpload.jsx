import React, { useState, useCallback } from 'react';
import { parseCSV, validateCSVFile, detectMeterDataFormat } from '../utils/csvParser';
import { processTimeSeriesData } from '../utils/dataProcessor';
import { useData } from '../context/DataContext';
import '../styles/dashboard.css';

const FileUpload = ({ onUploadComplete }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const { addUpload } = useData();

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const processFile = async (file) => {
        setIsProcessing(true);
        setError(null);

        try {
            // Validate file
            validateCSVFile(file);

            // Parse CSV
            const rawData = await parseCSV(file);

            // Detect format
            const format = detectMeterDataFormat(rawData);

            // Process data
            const processedData = processTimeSeriesData(rawData, format);

            // Save to context
            const upload = addUpload({
                filename: file.name,
                size: file.size,
                rowCount: processedData.length,
                format: format,
                data: processedData
            });

            if (onUploadComplete) {
                onUploadComplete(upload);
            }

            setIsProcessing(false);
        } catch (err) {
            setError(err.message);
            setIsProcessing(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, []);

    const handleFileInput = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    };

    return (
        <div className="file-upload-container">
            <div
                className={`file-upload-zone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isProcessing ? (
                    <div className="upload-processing">
                        <div className="spinner"></div>
                        <p>Processing CSV...</p>
                    </div>
                ) : (
                    <>
                        <div className="upload-icon">📊</div>
                        <h3>Upload Meter Data</h3>
                        <p>Drag and drop a CSV file here, or click to browse</p>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={handleFileInput}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input" className="upload-button">
                            Choose File
                        </label>
                        <p className="upload-hint">Maximum file size: 10MB</p>
                    </>
                )}
            </div>

            {error && (
                <div className="upload-error">
                    <span>❌</span> {error}
                </div>
            )}
        </div>
    );
};

export default FileUpload;
