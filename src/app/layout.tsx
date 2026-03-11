import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
    title: 'Film Market Intelligence & ROI Predictor',
    description: 'Identify Hidden Gem indie films and optimize theater swaps.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-slate-50 text-slate-800 antialiased selection:bg-emerald-100 selection:text-emerald-900`}>
                {children}
            </body>
        </html>
    );
}
