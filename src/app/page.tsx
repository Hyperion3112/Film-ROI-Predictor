'use client';

import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ROICrossoverChart from './components/ROICrossoverChart';
import { ArrowRight, AlertCircle, TrendingUp, Users, Clapperboard, Share2, Info, Menu } from 'lucide-react';

export default function Dashboard() {
    const [currentTab, setCurrentTab] = useState('overview');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    const { films, swaps, marketOverview } = data;
    const blockbusters = films.filter((f: any) => f.type === 'Blockbuster');
    const indies = films.filter((f: any) => f.type === 'Indie');

    return (
        <div className="flex min-h-screen font-sans bg-slate-50">
            <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

            <main className="flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-8 lg:p-10 overflow-y-auto h-screen relative bg-slate-50">
                <header className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3 md:gap-4">
                            <button 
                                className="lg:hidden mt-0.5 p-2 bg-white rounded-md border border-slate-200 shadow-sm text-slate-600 hover:bg-slate-50 transition-colors shrink-0"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-2xl sm:text-2xl font-semibold text-slate-900 tracking-tight flex flex-wrap items-center gap-2 sm:gap-3">
                                    {currentTab === 'overview' && 'Market Overview'}
                                    {currentTab === 'swaps' && 'Swap Recommendations'}
                                    {currentTab === 'social' && 'Social Sentiment Audit'}
                                    {currentTab === 'about' && 'About the Project'}
                                </h2>
                                <p className="text-slate-500 mt-1 text-sm font-medium">
                                    Data synthesized from {marketOverview.totalFilms}+ properties and real-time social streams.
                                </p>
                            </div>
                        </div>

                    </div>
                </header>

                {currentTab === 'overview' && (
                    <div className="space-y-6">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="glass-card p-5 rounded-lg flex flex-col justify-between h-32">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <Clapperboard className="w-4 h-4" />
                                    <h3 className="text-xs font-semibold uppercase tracking-wider">Total Tracking</h3>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{marketOverview.totalFilms}</p>
                            </div>

                            <div className="glass-card p-5 rounded-lg flex flex-col justify-between h-32">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <TrendingUp className="w-4 h-4" />
                                    <h3 className="text-xs font-semibold uppercase tracking-wider">Avg Breakout Prob</h3>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{marketOverview.avgIndieBreakout}%</p>
                            </div>

                            <div className="glass-card p-5 rounded-lg flex flex-col justify-between h-32">
                                <div className="flex items-center gap-2 text-slate-500">
                                    <AlertCircle className="w-4 h-4" />
                                    <h3 className="text-xs font-semibold uppercase tracking-wider">Avg Decay</h3>
                                </div>
                                <p className="text-3xl font-bold text-slate-900">{marketOverview.avgBlockbusterDecay}%</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="glass-card rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                                        <ArrowRight className="w-4 h-4 text-green-600" />
                                        Rising Indies
                                    </h3>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">Top Saturation</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {indies.sort((a: any, b: any) => b.saturationScore - a.saturationScore).slice(0, 5).map((indie: any, i: number) => (
                                        <div key={indie.id} className="flex justify-between items-center py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="text-xs font-medium text-slate-400 w-4">{i + 1}.</div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{indie.title}</p>
                                                    <p className="text-xs text-slate-500">{indie.genre}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-green-600">{indie.saturationScore}</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{indie.breakoutProbability}% BRK</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="glass-card rounded-lg p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-base text-slate-900 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-600" />
                                        Declining Blockbusters
                                    </h3>
                                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">High Decay</span>
                                </div>
                                <div className="divide-y divide-slate-100">
                                    {blockbusters.sort((a: any, b: any) => b.currentKpi.box_office_decay - a.currentKpi.box_office_decay).slice(0, 5).map((bb: any, i: number) => (
                                        <div key={bb.id} className="flex justify-between items-center py-3">
                                            <div className="flex gap-3 items-center">
                                                <div className="text-xs font-medium text-slate-400 w-4">{i + 1}.</div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{bb.title}</p>
                                                    <p className="text-xs text-slate-500">{bb.genre}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-semibold text-red-600">-{bb.currentKpi.box_office_decay}%</p>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider">{bb.currentKpi.occupancy_rate}% OCC</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentTab === 'swaps' && (
                    <div className="space-y-6">
                        {swaps.map((swap: any, idx: number) => (
                            <div key={idx} className="glass-card rounded-lg overflow-hidden">
                                <div className="bg-slate-50 border-b border-slate-200 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-lg shrink-0">
                                            #{idx + 1}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-lg mb-1">Recommended Swap</h3>
                                            <p className="text-sm text-slate-600 max-w-2xl">
                                                <strong className="text-slate-900 font-semibold mr-1">Strategy:</strong>
                                                {swap.strategicRecommendation}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-left md:text-right shrink-0">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">Crossover Score</p>
                                        <p className="text-2xl font-bold text-green-600">+{swap.roiCrossOverScore}</p>
                                    </div>
                                </div>

                                <div className="p-5 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                                    <div className="col-span-1 space-y-4 flex flex-col justify-center">
                                        <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
                                            <p className="text-[10px] uppercase tracking-wider text-red-600 font-semibold mb-2 flex items-center gap-2">
                                                <AlertCircle className="w-3 h-3" /> Remove
                                            </p>
                                            <h4 className="font-bold text-slate-900 text-base mb-3">{swap.blockbuster.title}</h4>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500">Occupancy</span>
                                                    <span className="font-semibold text-red-600">{swap.blockbuster.currentKpi.occupancy_rate}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500">Decay Risk</span>
                                                    <span className="font-semibold text-red-600">-{swap.blockbuster.currentKpi.box_office_decay}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
                                            <p className="text-[10px] uppercase tracking-wider text-green-600 font-semibold mb-2 flex items-center gap-2">
                                                <ArrowRight className="w-3 h-3" /> Promote
                                            </p>
                                            <h4 className="font-bold text-slate-900 text-base mb-3">{swap.indie.title}</h4>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500">Breakout Prob.</span>
                                                    <span className="font-semibold text-green-600">{swap.indie.breakoutProbability}%</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-500">Sentiment</span>
                                                    <span className="font-semibold text-green-600">{swap.indie.currentSignal.sentiment_score}/100</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex items-center border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                                        <ROICrossoverChart blockbuster={swap.blockbuster} indie={swap.indie} />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {swaps.length === 0 && (
                            <div className="py-16 text-center glass-card rounded-lg">
                                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">No Immediate Swaps Required</h3>
                                <p className="text-slate-500 text-sm max-w-md mx-auto">The current theatrical distribution perfectly matches market demand. The algorithm has not detected any highly profitable flip opportunities today.</p>
                            </div>
                        )}
                    </div>
                )}

                {currentTab === 'social' && (
                    <div>
                        <div className="glass-card rounded-lg overflow-hidden overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
                                <thead className="bg-slate-50 text-slate-500 text-xs font-semibold border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-4">Title / Genre</th>
                                        <th className="px-6 py-4">Tier</th>
                                        <th className="px-6 py-4 min-w-[200px]">Audience Sentiment</th>
                                        <th className="px-6 py-4">Momentum</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {films.sort((a: any, b: any) => b.currentSignal.sentiment_score - a.currentSignal.sentiment_score).map((film: any) => (
                                        <tr key={film.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900 text-sm">{film.title}</p>
                                                <p className="text-xs text-slate-500">{film.genre}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${film.type === 'Indie' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                                                    {film.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 min-w-[120px] overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full ${film.currentSignal.sentiment_score > 70 ? 'bg-green-500' : film.currentSignal.sentiment_score > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                                            style={{ width: `${Math.min(100, film.currentSignal.sentiment_score)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="font-semibold text-slate-700 w-8">{film.currentSignal.sentiment_score}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center justify-center min-w-[60px] px-2 py-1 rounded text-xs font-semibold ${film.currentSignal.mention_growth > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                                    {film.currentSignal.mention_growth > 0 ? '+' : ''}{film.currentSignal.mention_growth}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-md inline-flex items-center gap-2">
                                                    <Share2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {currentTab === 'about' && (
                    <div className="max-w-4xl">
                        <div className="glass-card rounded-lg p-8 mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 mb-4">
                                Welcome to the Film ROI Predictor!
                            </h3>
                            <p className="text-base text-slate-600 leading-relaxed mb-8">
                                This dashboard was built to solve a simple problem in the movie business: how do we make sure the right movies are playing in the right theaters at the right time?
                            </p>

                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
                                        What does this project do?
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Imagine you're managing a movie theater. You've got a massive $200 million blockbuster playing in your biggest room, but after opening weekend, audience interest drops off faster than expected and the theater starts looking empty. In the meantime, a smaller indie film is suddenly blowing up on social media, but you only have it playing in your smallest room and tickets are constantly sold out.
                                    </p>
                                    <p className="text-slate-600 text-sm leading-relaxed mt-4">
                                        I built this dashboard to help solve that problem. It pulls in real-time movie data from the TMDB API and combines it with simulated social sentiment data (like Twitter or TikTok trends). The goal is to automatically flag these situations and recommend "Swaps" - basically suggesting when it makes financial sense to bump the declining blockbuster and move the trending indie film to a bigger screen.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-lg text-slate-900 mb-2 flex items-center gap-2">
                                        The Inspiration
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        Hi, I'm <strong className="text-slate-800">Shaunak</strong>. I created this project to explore my interest in data analytics and the entertainment industry. I've always thought it was interesting how the online conversation around a movie can shift so quickly, while the actual physical distribution of the movie in theaters takes a lot longer to adapt.
                                    </p>
                                    <p className="text-slate-600 text-sm leading-relaxed mt-4">
                                        I wanted to build a portfolio piece that takes qualitative data (like public opinion) and uses it to suggest concrete business decisions. By tying a modern React frontend with this predictive logic, I wanted to showcase how alternative data can be visualized to make managing theater logistics a bit smarter.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                                    <h4 className="font-semibold text-lg text-slate-900 mb-4 flex items-center gap-2">
                                        Built With
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            "React",
                                            "Next.js",
                                            "TypeScript",
                                            "Tailwind CSS",
                                            "SQLite",
                                            "Recharts",
                                            "Lucide Icons",
                                            "TMDB API"
                                        ].map((tech) => (
                                            <span
                                                key={tech}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 shadow-sm"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
