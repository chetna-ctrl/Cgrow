import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class GlobalErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-red-100">
                        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="text-red-500" size={32} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 mb-2">Something went wrong</h2>
                        <p className="text-slate-500 text-sm mb-6">
                            Don't worry, your data is safe. We just encountered an unexpected issue while rendering the dashboard.
                        </p>

                        <div className="bg-slate-100 p-3 rounded-lg text-left mb-6 overflow-auto max-h-32">
                            <code className="text-[10px] text-slate-600 font-mono block">
                                {this.state.error && this.state.error.toString()}
                            </code>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200"
                            >
                                <RefreshCw size={18} />
                                Reload App
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-slate-100 hover:border-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                            >
                                <Home size={18} />
                                Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
