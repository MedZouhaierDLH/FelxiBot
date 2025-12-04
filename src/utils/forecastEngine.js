// Simple linear regression forecasting for time-series data
export function forecastLinear(data, horizon = 24) {
    if (!data || data.length < 2) {
        throw new Error('Insufficient data for forecasting');
    }

    // Extract x (time index) and y (values)
    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data.map(d => d.value);

    // Calculate linear regression: y = mx + b
    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumX2 = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate residuals for confidence interval
    const predictions = x.map(xi => slope * xi + intercept);
    const residuals = y.map((yi, i) => yi - predictions[i]);
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / n;
    const stdError = Math.sqrt(mse);

    // Detect hourly seasonality (simple approach)
    const hourlyPattern = detectHourlyPattern(data);

    // Generate forecast
    const forecast = [];
    for (let i = 0; i < horizon; i++) {
        const futureX = n + i;
        const trend = slope * futureX + intercept;

        // Add seasonal component
        const hour = (data.length + i) % 24;
        const seasonal = hourlyPattern[hour] || 0;

        const predicted = trend + seasonal;
        const lower = predicted - 1.96 * stdError; // 95% CI
        const upper = predicted + 1.96 * stdError;

        forecast.push({
            index: futureX,
            value: Math.max(0, predicted),
            lower: Math.max(0, lower),
            upper: Math.max(0, upper)
        });
    }

    return {
        forecast,
        trend: { slope, intercept },
        confidence: stdError,
        historical: data.map((d, i) => ({
            ...d,
            predicted: predictions[i]
        }))
    };
}

function detectHourlyPattern(data) {
    // Calculate average for each hour of day
    const hourlyAverages = Array(24).fill(0);
    const hourlyCounts = Array(24).fill(0);

    data.forEach((point, index) => {
        const hour = index % 24;
        hourlyAverages[hour] += point.value;
        hourlyCounts[hour]++;
    });

    const pattern = hourlyAverages.map((sum, hour) => {
        if (hourlyCounts[hour] === 0) return 0;
        const avg = sum / hourlyCounts[hour];
        const overallAvg = data.reduce((s, d) => s + d.value, 0) / data.length;
        return avg - overallAvg; // Seasonal deviation
    });

    return pattern;
}

export function identifyPeakHours(data) {
    const hourlyAverages = Array(24).fill(0);
    const hourlyCounts = Array(24).fill(0);

    data.forEach((point, index) => {
        const hour = index % 24;
        hourlyAverages[hour] += point.value;
        hourlyCounts[hour]++;
    });

    const averages = hourlyAverages.map((sum, hour) => ({
        hour,
        average: hourlyCounts[hour] > 0 ? sum / hourlyCounts[hour] : 0
    }));

    // Sort by average and get top 3
    const peaks = averages
        .sort((a, b) => b.average - a.average)
        .slice(0, 3);

    return peaks;
}

export function calculateForecastAccuracy(historical, actual) {
    if (!historical || !actual || historical.length !== actual.length) {
        return null;
    }

    const errors = historical.map((h, i) => Math.abs(h.predicted - actual[i].value));
    const mae = errors.reduce((sum, e) => sum + e, 0) / errors.length;

    const actualMean = actual.reduce((sum, a) => sum + a.value, 0) / actual.length;
    const mape = errors.reduce((sum, e, i) => sum + (e / actual[i].value) * 100, 0) / errors.length;

    return {
        mae: mae.toFixed(2),
        mape: mape.toFixed(2) + '%',
        rmse: Math.sqrt(errors.reduce((sum, e) => sum + e * e, 0) / errors.length).toFixed(2)
    };
}
