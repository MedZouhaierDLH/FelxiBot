import Papa from 'papaparse';

export const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.errors.length > 0) {
                    reject(new Error('CSV parsing errors: ' + results.errors[0].message));
                    return;
                }
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};

export const detectMeterDataFormat = (data) => {
    if (!data || data.length === 0) {
        throw new Error('No data provided');
    }

    const firstRow = data[0];
    const headers = Object.keys(firstRow).map(h => h.toLowerCase());

    // Detect timestamp column
    const timestampCol = headers.find(h =>
        h.includes('time') || h.includes('date') || h.includes('timestamp')
    );

    // Detect value column (kWh, consumption, load, etc.)
    const valueCol = headers.find(h =>
        h.includes('kwh') || h.includes('consumption') ||
        h.includes('load') || h.includes('value') || h.includes('power')
    );

    // Detect customer/meter ID
    const idCol = headers.find(h =>
        h.includes('id') || h.includes('customer') || h.includes('meter')
    );

    if (!timestampCol || !valueCol) {
        throw new Error('Could not detect timestamp or value columns');
    }

    return {
        timestampColumn: Object.keys(firstRow)[headers.indexOf(timestampCol)],
        valueColumn: Object.keys(firstRow)[headers.indexOf(valueCol)],
        idColumn: idCol ? Object.keys(firstRow)[headers.indexOf(idCol)] : null,
        detectedHeaders: headers
    };
};

export const validateCSVFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!file) {
        throw new Error('No file provided');
    }

    if (file.size > maxSize) {
        throw new Error('File size exceeds 10MB limit');
    }

    if (!file.name.endsWith('.csv')) {
        throw new Error('File must be a CSV');
    }

    return true;
};
