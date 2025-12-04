import { format, parseISO } from 'date-fns';

export const processTimeSeriesData = (rawData, config) => {
    const { timestampColumn, valueColumn, idColumn } = config;

    try {
        const processedData = rawData.map(row => {
            let timestamp;
            try {
                timestamp = new Date(row[timestampColumn]);
                if (isNaN(timestamp.getTime())) {
                    throw new Error('Invalid date');
                }
            } catch (e) {
                // Try parsing common formats
                timestamp = parseISO(row[timestampColumn]);
            }

            const value = parseFloat(row[valueColumn]);

            if (isNaN(value)) {
                return null;
            }

            return {
                timestamp: timestamp.getTime(),
                timestampFormatted: format(timestamp, 'yyyy-MM-dd HH:mm'),
                value: value,
                customerId: idColumn ? row[idColumn] : null
            };
        }).filter(Boolean); // Remove invalid rows

        return processedData.sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
        throw new Error(`Data processing failed: ${error.message}`);
    }
};

export const calculateStats = (data) => {
    if (!data || data.length === 0) {
        return null;
    }

    const values = data.map(d => d.value);

    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Peak detection (top 5%)
    const sorted = [...values].sort((a, b) => b - a);
    const peakThreshold = sorted[Math.floor(values.length * 0.05)];
    const peakCount = values.filter(v => v >= peakThreshold).length;

    // Find peak time
    const peakEntry = data.find(d => d.value === max);

    return {
        count: data.length,
        total: sum.toFixed(2),
        average: avg.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        peakTime: peakEntry ? peakEntry.timestampFormatted : null,
        peakCount,
        unit: 'kWh' // Default, could be detected
    };
};

export const aggregateByPeriod = (data, period = 'hour') => {
    // Simple hourly aggregation for now
    const grouped = {};

    data.forEach(point => {
        const date = new Date(point.timestamp);
        const key = format(date, period === 'hour' ? 'yyyy-MM-dd HH:00' : 'yyyy-MM-dd');

        if (!grouped[key]) {
            grouped[key] = { timestamp: key, values: [] };
        }
        grouped[key].values.push(point.value);
    });

    return Object.values(grouped).map(group => ({
        timestamp: group.timestamp,
        value: group.values.reduce((sum, v) => sum + v, 0) / group.values.length
    }));
};
