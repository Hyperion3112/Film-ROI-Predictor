import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';

export async function GET() {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Fetch all movies
        const movies = await query('SELECT * FROM movies');
        const signals = await query('SELECT * FROM social_signals ORDER BY date ASC');
        const kpis = await query('SELECT * FROM theatrical_kpis ORDER BY date ASC');

        // Process data
        const films = movies.map((movie) => {
            const filmSignals = signals.filter(s => s.film_id === movie.id);
            const filmKpis = kpis.filter(k => k.film_id === movie.id);

            const historicalSignals = filmSignals.filter(s => s.date <= today);
            const forecastSignals = filmSignals.filter(s => s.date > today);

            const historicalKpis = filmKpis.filter(k => k.date <= today);
            const forecastKpis = filmKpis.filter(k => k.date > today);

            const currentSignal = historicalSignals[historicalSignals.length - 1] || filmSignals[0];
            const currentKpi = historicalKpis[historicalKpis.length - 1] || filmKpis[0];

            // Calculate derived metrics and pre-round for the frontend
            const rawSaturation = (currentSignal.sentiment_score * 0.4) + (currentKpi.occupancy_rate * 0.4) + (currentSignal.mention_growth * 0.2);
            const saturationScore = Math.round(Math.min(100, Math.max(0, rawSaturation)));

            // Breakout Probability (indies mainly)
            let breakoutProbability = 0;
            if (movie.type === 'Indie') {
                const recentGrowth = currentSignal.mention_growth;
                const projectedOccupancyGrowth = forecastKpis.length > 0 ?
                    (forecastKpis[forecastKpis.length - 1].occupancy_rate - currentKpi.occupancy_rate) : 0;

                const rawBreakout = recentGrowth * 2 + (projectedOccupancyGrowth * 1.5) + (currentSignal.sentiment_score * 0.2);
                breakoutProbability = Math.round(Math.min(100, Math.max(0, rawBreakout)));
            }

            // Pre-round core metrics for cleaner UI
            const cleanSignal = {
                ...currentSignal,
                sentiment_score: Math.round(currentSignal.sentiment_score),
                mention_growth: Math.round(currentSignal.mention_growth)
            };

            const cleanKpi = {
                ...currentKpi,
                occupancy_rate: Math.round(currentKpi.occupancy_rate),
                box_office_decay: Math.round(currentKpi.box_office_decay),
                per_screen_avg: Math.round(currentKpi.per_screen_avg)
            };

            return {
                ...movie,
                currentSignal: cleanSignal,
                currentKpi: cleanKpi,
                historicalSignals,
                forecastSignals,
                historicalKpis,
                forecastKpis,
                saturationScore,
                breakoutProbability
            };
        });

        const blockbusters = films.filter(f => f.type === 'Blockbuster');
        const indies = films.filter(f => f.type === 'Indie');

        // Identify Swap Opportunities
        const allPotentialSwaps = [];
        for (const bb of blockbusters) {
            // Find blockbusters where decay is high and occupancy is dropping
            if (bb.currentKpi.box_office_decay > 40 && bb.currentKpi.occupancy_rate < 60) {
                // Find indies with high breakout prob and strong sentiment
                for (const indie of indies) {
                    // Saturation Score: A weighted algorithm that flags 'Swap Opportunities' when an indie film's projected growth exceeds a blockbuster's current performance floor.
                    const indieProjectedGrowth = indie.breakoutProbability;
                    const bbPerformanceFloor = bb.currentKpi.occupancy_rate;

                    if (indieProjectedGrowth > bbPerformanceFloor && indie.currentSignal.sentiment_score > bb.currentSignal.sentiment_score + 10) {

                        const sentimentRatio = (indie.currentSignal.sentiment_score / (bb.currentSignal.sentiment_score || 1)).toFixed(1);
                        const cleanCrossoverScore = Math.round(indieProjectedGrowth - bbPerformanceFloor);

                        allPotentialSwaps.push({
                            blockbuster: bb,
                            indie: indie,
                            strategicRecommendation: `Replace '${bb.title}' with '${indie.title}' due to a ${~~((Number(sentimentRatio) - 1) * 100)}% higher sentiment-to-screen ratio and a breakout probability of ${indie.breakoutProbability}%.`,
                            roiCrossOverScore: cleanCrossoverScore // metric for sorting
                        });
                    }
                }
            }
        }

        // Deduplicate and get top 5 swaps
        allPotentialSwaps.sort((a, b) => b.roiCrossOverScore - a.roiCrossOverScore);
        
        const topSwaps = [];
        const usedBlockbusters = new Set();
        const usedIndies = new Set();

        for (const swap of allPotentialSwaps) {
            if (!usedBlockbusters.has(swap.blockbuster.id) && !usedIndies.has(swap.indie.id)) {
                topSwaps.push(swap);
                usedBlockbusters.add(swap.blockbuster.id);
                usedIndies.add(swap.indie.id);
            }
            if (topSwaps.length >= 5) break;
        }

        return NextResponse.json({
            films,
            swaps: topSwaps,
            marketOverview: {
                totalFilms: films.length,
                avgIndieBreakout: Math.round(indies.reduce((sum, f) => sum + f.breakoutProbability, 0) / (indies.length || 1)),
                avgBlockbusterDecay: Math.round(blockbusters.reduce((sum, f) => sum + f.currentKpi.box_office_decay, 0) / (blockbusters.length || 1))
            }
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
