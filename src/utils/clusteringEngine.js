import { kmeans as KMeans } from 'ml-kmeans';

export function prepareCustomerFeatures(data) {
    // Group data by customer_id
    const customerGroups = {};

    data.forEach(point => {
        const custId = point.customerId || 'UNKNOWN';
        if (!customerGroups[custId]) {
            customerGroups[custId] = [];
        }
        customerGroups[custId].push(point);
    });

    // Extract features for each customer
    const customers = Object.entries(customerGroups).map(([id, points]) => {
        const values = points.map(p => p.value);
        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        // Peak hour (hour with highest avg consumption)
        const hourlyAvg = Array(24).fill(0);
        const hourlyCounts = Array(24).fill(0);
        points.forEach((p, idx) => {
            const hour = idx % 24;
            hourlyAvg[hour] += p.value;
            hourlyCounts[hour]++;
        });
        const hourlyAverages = hourlyAvg.map((sum, h) =>
            hourlyCounts[h] > 0 ? sum / hourlyCounts[h] : 0
        );
        const peakHour = hourlyAverages.indexOf(Math.max(...hourlyAverages));

        // Variance
        const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;

        return {
            id,
            features: [
                avg,           // Average consumption
                max,           // Peak load
                variance,      // Load variability
                peakHour,      // Peak hour of day
                max / avg      // Peak-to-average ratio
            ],
            stats: {
                total: sum,
                average: avg,
                peak: max,
                peakHour,
                variance: Math.sqrt(variance),
                dataPoints: points.length
            }
        };
    });

    return customers;
}

export function runKMeansClustering(customers, k = 3) {
    if (customers.length < k) {
        throw new Error(`Not enough customers (${customers.length}) for ${k} clusters`);
    }

    // Extract feature vectors
    const featureVectors = customers.map(c => c.features);

    // Normalize features (0-1 scale)
    const normalized = normalizeFeatures(featureVectors);

    // Run k-means
    const result = KMeans(normalized, k, {
        initialization: 'kmeans++',
        maxIterations: 100
    });

    // Assign clusters
    const clusteredCustomers = customers.map((customer, i) => ({
        ...customer,
        cluster: result.clusters[i]
    }));

    // Calculate cluster statistics
    const clusterStats = Array(k).fill(null).map((_, clusterIdx) => {
        const members = clusteredCustomers.filter(c => c.cluster === clusterIdx);

        if (members.length === 0) {
            return {
                id: clusterIdx,
                size: 0,
                avgLoad: 0,
                peakLoad: 0,
                members: []
            };
        }

        const avgLoad = members.reduce((sum, m) => sum + m.stats.average, 0) / members.length;
        const peakLoad = Math.max(...members.map(m => m.stats.peak));
        const commonPeakHour = mostCommon(members.map(m => m.stats.peakHour));

        return {
            id: clusterIdx,
            size: members.length,
            avgLoad: avgLoad.toFixed(2),
            peakLoad: peakLoad.toFixed(2),
            commonPeakHour,
            members: members.map(m => m.id)
        };
    });

    return {
        customers: clusteredCustomers,
        clusters: clusterStats,
        centroids: result.centroids
    };
}

function normalizeFeatures(vectors) {
    const numFeatures = vectors[0].length;
    const mins = Array(numFeatures).fill(Infinity);
    const maxs = Array(numFeatures).fill(-Infinity);

    // Find min/max for each feature
    vectors.forEach(vec => {
        vec.forEach((val, i) => {
            mins[i] = Math.min(mins[i], val);
            maxs[i] = Math.max(maxs[i], val);
        });
    });

    // Normalize
    return vectors.map(vec =>
        vec.map((val, i) => {
            const range = maxs[i] - mins[i];
            return range === 0 ? 0 : (val - mins[i]) / range;
        })
    );
}

function mostCommon(arr) {
    const counts = {};
    arr.forEach(val => counts[val] = (counts[val] || 0) + 1);
    return Object.keys(counts).reduce((a, b) =>
        counts[a] > counts[b] ? a : b
    );
}
