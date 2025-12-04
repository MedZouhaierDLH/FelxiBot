// Business Case ROI Calculator
export function calculateBusinessCase(inputs) {
    const {
        annualBaselineKWh,
        peakLoadKW,
        avgReductionPercent,
        eventsPerYear,
        energyCostPerKWh = 0.15,
        peakTariffPremium = 0.30,
        demandChargePerKW = 5.0,
        implementationCost = 50000,
        discountRate = 0.05
    } = inputs;

    // Annual savings calculation
    const hourlyReduction = (annualBaselineKWh / 8760) * (avgReductionPercent / 100);
    const avgEventDuration = 3; // hours

    const energySavingsPerEvent = hourlyReduction * avgEventDuration * energyCostPerKWh;
    const annualEnergySavings = energySavingsPerEvent * eventsPerYear;

    const peakReductionKW = peakLoadKW * (avgReductionPercent / 100);
    const peakDemandSavings = peakReductionKW * demandChargePerKW * 12; // Monthly

    const totalAnnualSavings = annualEnergySavings + peakDemandSavings;

    // Financial metrics
    const paybackPeriod = implementationCost / totalAnnualSavings;

    // 5-year NPV calculation
    let npv = -implementationCost;
    for (let year = 1; year <= 5; year++) {
        npv += totalAnnualSavings / Math.pow(1 + discountRate, year);
    }

    const benefitCostRatio = (totalAnnualSavings * 5) / implementationCost;
    const roi = ((totalAnnualSavings * 5 - implementationCost) / implementationCost) * 100;

    return {
        annualSavings: totalAnnualSavings.toFixed(2),
        energySavings: annualEnergySavings.toFixed(2),
        demandSavings: peakDemandSavings.toFixed(2),
        paybackYears: paybackPeriod.toFixed(1),
        fiveYearNPV: npv.toFixed(2),
        benefitCostRatio: benefitCostRatio.toFixed(2),
        roi: roi.toFixed(1),
        totalFiveYearSavings: (totalAnnualSavings * 5).toFixed(2)
    };
}

export function generateBusinessCaseBreakdown(businessCase) {
    const years = [];
    const annualSavings = parseFloat(businessCase.annualSavings);
    const implementationCost = parseFloat(businessCase.paybackYears) * annualSavings;

    let cumulativeSavings = -implementationCost;

    for (let year = 0; year <= 5; year++) {
        if (year === 0) {
            years.push({
                year: 0,
                savings: 0,
                costs: implementationCost,
                netCashFlow: -implementationCost,
                cumulative: -implementationCost
            });
        } else {
            cumulativeSavings += annualSavings;
            years.push({
                year,
                savings: annualSavings,
                costs: 0,
                netCashFlow: annualSavings,
                cumulative: cumulativeSavings
            });
        }
    }

    return years;
}

export function assessBusinessCaseViability(businessCase) {
    const payback = parseFloat(businessCase.paybackYears);
    const bcr = parseFloat(businessCase.benefitCostRatio);
    const roi = parseFloat(businessCase.roi);

    let viability = 'unknown';
    let recommendation = '';

    if (payback <= 2 && bcr >= 2 && roi >= 100) {
        viability = 'excellent';
        recommendation = 'Highly recommended - Strong financial case with rapid payback';
    } else if (payback <= 3 && bcr >= 1.5 && roi >= 50) {
        viability = 'good';
        recommendation = 'Recommended - Solid business case with reasonable returns';
    } else if (payback <= 5 && bcr >= 1.2 && roi >= 20) {
        viability = 'moderate';
        recommendation = 'Consider - Acceptable returns but monitor carefully';
    } else {
        viability = 'poor';
        recommendation = 'Not recommended - Weak financial justification';
    }

    return { viability, recommendation };
}
