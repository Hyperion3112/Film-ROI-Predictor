import { LayoutDashboard, ArrowRightLeft, MessageSquareWarning, TrendingUp, Info, X } from 'lucide-react';

interface SidebarProps {
    currentTab: string;
    setCurrentTab: (tab: string) => void;
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ currentTab, setCurrentTab, isMobileMenuOpen, setIsMobileMenuOpen }: SidebarProps) {
    const tabs = [
        { id: 'overview', label: 'Market Overview', icon: LayoutDashboard },
        { id: 'swaps', label: 'Swap Recommendations', icon: ArrowRightLeft },
        { id: 'social', label: 'Social Sentiment Audit', icon: MessageSquareWarning },
        { id: 'about', label: 'About the Project', icon: Info },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
            
            <div className={`fixed lg:sticky top-0 left-0 z-50 w-72 bg-white border-r border-slate-200 h-screen flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                {/* Close button for mobile */}
                <button 
                    className="lg:hidden absolute top-6 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6 pr-14 border-b border-slate-200 flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
                        <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                <div>
                    <h1 className="font-semibold text-lg leading-tight tracking-tight text-slate-900">Film ROI Predictor</h1>
                </div>
            </div>
            
            <nav className="flex-1 p-4 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-3 px-3">Dashboards</div>
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setCurrentTab(tab.id);
                                setIsMobileMenuOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-slate-100 text-slate-900'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-slate-200">
                <div className="bg-slate-50 rounded-md p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-[pulseSlow_3s_ease-in-out_infinite]"></div>
                        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide">System Status</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">Live API Connected.<br/>Processing 50+ properties.</p>
                </div>
            </div>
        </div>
        </>
    );
}
