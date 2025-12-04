// DR Event Simulation Engine
export function simulateDREvent(baselineData, eventConfig) {
    const { startHour, endHour, reductionPercent, participationRate = 100 } = eventConfig;

    if (!baselineData || baselineData.length === 0) {
        throw new Error('No baseline data provided');
    }

    const effectiveReduction = (reductionPercent / 100) * (participationRate / 100);

    // Clone baseline and apply reduction during event window
    const simulatedData = baselineData.map((point, index) => {
        const hour = index % 24;
        const isEventHour = hour >= startHour && hour < endHour;

        const reducedValue = isEventHour
            ? point.value * (1 - effectiveReduction)
            : point.value;

        return {
            ...point,
            reducedValue,
            isEventHour,
            reduction: isEventHour ? point.value - reducedValue : 0
        };
    });

    // Calculate savings
    const totalReduction = simulatedData.reduce((sum, p) => sum + p.reduction, 0);
    const peakReduction = Math.max(...simulatedData.filter(p => p.isEventHour).map(p => p.reduction));

    return {
        original: baselineData,
        simulated: simulatedData,
        totalReductionKWh: totalReduction.toFixed(2),
        peakReductionKW: peakReduction.toFixed(2),
        eventHours: endHour - startHour
    };
}

export function calculateDRSavings(simulationResult, pricing) {
    const { energyRate = 0.15, peakPremium = 0.10, demandCharge = 5.0 } = pricing;

    const totalReduction = parseFloat(simulationResult.totalReductionKWh);
    const peakReduction = parseFloat(simulationResult.peakReductionKW);

    // Energy savings
    const energySavings = totalReduction * energyRate;

    // Peak demand savings
    const peakSavings = peakReduction * peakPremium * simulationResult.eventHours;

    // Demand charge savings (monthly)
    const demandSavings = peakReduction * demandCharge;

    const totalSavings = energySavings + peakSavings + demandSavings;

    return {
        energySavings: energySavings.toFixed(2),
        peakSavings: peakSavings.toFixed(2),
        demandSavings: demandSavings.toFixed(2),
        totalSavings: totalSavings.toFixed(2),
        currency: '€'
    };
}

export function generateDRRecommendations(baselineData, forecastData) {
    // Identify high-load periods
    const avgLoad = baselineData.reduce((sum, p) => sum + p.value, 0) / baselineData.length;
    const peakThreshold = avgLoad * 1.3;

    const highLoadHours = [];
    for (let hour = 0; hour < 24; hour++) {
        const hourlyData = baselineData.filter((_, i) => i % 24 === hour);
        const hourlyAvg = hourlyData.reduce((sum, p) => sum + p.value, 0) / hourlyData.length;

        if (hourlyAvg > peakThreshold) {
            highLoadHours.push({ hour, avgLoad: hourlyAvg });
        }
    }

    // Sort by load
    highLoadHours.sort((a, b) => b.avgLoad - a.avgLoad);

    const recommendations = [];

    if (highLoadHours.length > 0) {
        const topPeakHour = highLoadHours[0];
        recommendations.push({
            type: 'peak_shaving',
            title: 'Target Peak Hours',
            description: `Schedule DR events during ${topPeakHour.hour}:00-${topPeakHour.hour + 2}:00 when load averages ${topPeakHour.avgLoad.toFixed(1)} kW`,
            priority: 'high',
            estimatedImpact: '15-25% peak reduction'
        });
    }

    recommendations.push({
        type: 'participation',
        title: 'Increase Participation',
        description: 'Target customers with high baseline consumption for maximum impact',
        priority: 'medium',
        estimatedImpact: '10-15% additional savings'
    });

    recommendations.push({
        type: 'timing',
        title: 'Event Duration',
        description: 'Optimal DR events are 2-4 hours to balance savings and customer fatigue',
        priority: 'medium',
        estimatedImpact: 'Improved participation rates'
    });

    return recommendations;
}
