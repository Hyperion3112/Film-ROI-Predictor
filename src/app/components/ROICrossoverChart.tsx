import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ROICrossoverChartProps {
    blockbuster: any;
    indie: any;
}

export default function ROICrossoverChart({ blockbuster, indie }: ROICrossoverChartProps) {
    // Merge historical and forecast KPIs
    const allBBKpis = [...blockbuster.historicalKpis, ...blockbuster.forecastKpis];
    const allIndieKpis = [...indie.historicalKpis, ...indie.forecastKpis];

    const today = new Date().toISOString().split('T')[0];

    const data = allBBKpis.map((bbKpi, index) => {
        const indieKpi = allIndieKpis[index];
        return {
            date: new Date(bbKpi.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
            fullDate: bbKpi.date,
            [blockbuster.title]: bbKpi.occupancy_rate,
            [indie.title]: indieKpi ? indieKpi.occupancy_rate : 0,
            isForecast: bbKpi.date > today
        };
    });

    return (
        <div className="h-72 w-full animate-fade-in-up">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-6 px-2">Occupancy Trajectory Validating Swap</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                        <linearGradient id="colorBB" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorIndie" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                        tickMargin={12}
                        axisLine={false}
                        tickLine={false}
                        minTickGap={20}
                    />
                    <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 100]}
                        tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                            borderRadius: '12px', 
                            border: '1px solid rgba(255,255,255,0.1)', 
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                            color: '#fff',
                            backdropFilter: 'blur(8px)'
                        }}
                        itemStyle={{ fontWeight: 600 }}
                        labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '13px', fontWeight: 500, paddingTop: '16px' }} />
                    <ReferenceLine x={data.find(d => !d.isForecast)?.date} stroke="#cbd5e1" strokeDasharray="4 4" label={{ position: 'top', value: 'Today', fill: '#64748b', fontSize: 12, fontWeight: 600 }} />

                    <Area
                        type="monotone"
                        dataKey={blockbuster.title}
                        stroke="#f43f5e"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorBB)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#f43f5e' }}
                    />
                    <Area
                        type="monotone"
                        dataKey={indie.title}
                        stroke="#10b981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIndie)"
                        activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
