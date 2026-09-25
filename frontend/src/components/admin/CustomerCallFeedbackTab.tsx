import React, { useState, useEffect, useMemo } from 'react';
import { ExternalLink, RefreshCw, FileText, CheckCircle2, XCircle, AlertTriangle, Search, Filter, X, ChevronRight, Phone } from 'lucide-react';
import { callService, CallBatch } from '../../services/callService';

export const CustomerCallFeedbackTab: React.FC = () => {
    const [batches, setBatches] = useState<CallBatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState<number | null>(null);
    const [generationError, setGenerationError] = useState<{ [key: number]: string }>({});

    // Search and Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Modal State
    const [selectedBatch, setSelectedBatch] = useState<CallBatch | null>(null);

    const loadBatches = async () => {
        try {
            const data = await callService.getCallBatches();
            setBatches(data);
        } catch (err) {
            console.error("Failed to load batches", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBatches();
    }, []);

    const handleGenerateSheet = async (batchId: number) => {
        setIsGenerating(batchId);
        setGenerationError(prev => ({ ...prev, [batchId]: '' }));
        
        try {
            await callService.generateGoogleSheet(batchId);
            const updatedBatch = await callService.getCallBatch(batchId);
            setBatches(prev => prev.map(b => b.id === batchId ? updatedBatch : b));
            if (selectedBatch && selectedBatch.id === batchId) {
                setSelectedBatch(updatedBatch);
            }
        } catch (err: any) {
            console.error(err);
            setGenerationError(prev => ({ 
                ...prev, 
                [batchId]: err.response?.data?.detail || "Calls completed, but Google Sheet could not be created." 
            }));
        } finally {
            setIsGenerating(null);
        }
    };

    // Filter Batches based on Search (checking batch name, or if any customer in the batch matches)
    const filteredBatches = useMemo(() => {
        return batches.filter(batch => {
            const matchesSearch = 
                batch.batch_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                batch.calls?.some(c => 
                    c.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    c.phone_number.includes(searchQuery)
                );
                
            const matchesStatus = filterStatus === 'All' || batch.status === filterStatus;
            
            return matchesSearch && matchesStatus;
        });
    }, [batches, searchQuery, filterStatus]);

    if (loading) {
        return <div className="p-8 text-center text-gray-500 flex items-center justify-center gap-2"><RefreshCw className="w-5 h-5 animate-spin"/> Loading feedback...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900">Customer Call Feedback</h2>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search names, phones, batches..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Completed">Completed</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                    <button 
                        onClick={loadBatches}
                        className="p-2 text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors shrink-0"
                        title="Refresh List"
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {filteredBatches.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl border border-gray-200">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No Feedback Available</h3>
                    <p className="text-gray-500 mt-1">Start processing customer calls or adjust your search filters.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBatches.map(batch => (
                        <div key={batch.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-gray-900 truncate" title={batch.batch_name}>{batch.batch_name}</h3>
                                <p className="text-sm text-gray-500">
                                    {new Date(batch.batch_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            
                            <div className="flex-1 space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Total Customers</span>
                                    <span className="font-semibold">{batch.total_customers}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Completed
                                    </span>
                                    <span className="font-semibold text-gray-900">{batch.completed_calls}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600 flex items-center gap-1.5">
                                        <XCircle className="w-4 h-4 text-red-500" /> Failed / No Answer
                                    </span>
                                    <span className="font-semibold text-gray-900">{batch.failed_calls}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm pt-2 border-t border-gray-50">
                                    <span className="text-gray-600">Interested</span>
                                    <span className="font-semibold text-amber-600">
                                        {batch.calls?.filter(c => c.call_outcome === 'Interested').length || 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Follow-ups Required</span>
                                    <span className="font-semibold text-amber-600">
                                        {batch.calls?.filter(c => c.follow_up_required).length || 0}
                                    </span>
                                </div>
                            </div>
                            
                            {generationError[batch.id] && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                                    <p className="text-xs text-red-700">{generationError[batch.id]}</p>
                                </div>
                            )}
                            
                            <div className="pt-4 border-t border-gray-100 mt-auto flex flex-col gap-2">
                                <button
                                    onClick={() => setSelectedBatch(batch)}
                                    className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                                >
                                    View Details
                                </button>
                                
                                {batch.status === 'In Progress' ? (
                                    <div className="text-sm font-medium text-blue-600 text-center py-2 bg-blue-50 rounded-lg">
                                        Calls in progress...
                                    </div>
                                ) : batch.google_sheet_url ? (
                                    <div className="space-y-2">
                                        <a 
                                            href={batch.google_sheet_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-700 py-2 rounded-lg font-medium hover:bg-green-100 transition-colors text-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Open Google Sheet
                                        </a>
                                        {generationError[batch.id] && (
                                            <button 
                                                onClick={() => handleGenerateSheet(batch.id)}
                                                disabled={isGenerating === batch.id}
                                                className="w-full text-xs text-blue-600 hover:underline"
                                            >
                                                Retry Sheet Generation
                                            </button>
                                        )}
                                    </div>
                                ) : batch.status === 'Completed' ? (
                                    <button 
                                        onClick={() => handleGenerateSheet(batch.id)}
                                        disabled={isGenerating === batch.id}
                                        className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-70 text-sm"
                                    >
                                        {isGenerating === batch.id ? (
                                            <><RefreshCw className="w-4 h-4 animate-spin" /> Generating...</>
                                        ) : (
                                            <>Generate Google Sheet</>
                                        )}
                                    </button>
                                ) : (
                                    <div className="text-sm font-medium text-gray-500 text-center py-2 bg-gray-50 rounded-lg">
                                        Status: {batch.status}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Batch Details Modal */}
            {selectedBatch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-gray-100">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Phone className="w-5 h-5 text-amber-600" />
                                    {selectedBatch.batch_name} Details
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {selectedBatch.calls?.length || 0} Customers in this batch
                                </p>
                            </div>
                            <button 
                                onClick={() => setSelectedBatch(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        {/* Modal Body - Fully Responsive Table/Cards */}
                        <div className="flex-1 overflow-auto bg-gray-50/50 p-5">
                            <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200 bg-white">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Customer</th>
                                            <th className="px-4 py-3 font-medium">Phone</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium">Outcome</th>
                                            <th className="px-4 py-3 font-medium">Interest</th>
                                            <th className="px-4 py-3 font-medium">Follow-up</th>
                                            <th className="px-4 py-3 font-medium">Duration</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedBatch.calls?.map((call, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-900">{call.customer_name}</td>
                                                <td className="px-4 py-3 text-gray-600">{call.phone_number}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                        call.call_status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        call.call_status === 'Failed' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {call.call_status || 'Pending'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-700">{call.call_outcome || '-'}</td>
                                                <td className="px-4 py-3 text-gray-700">{call.customer_interest || '-'}</td>
                                                <td className="px-4 py-3">
                                                    {call.follow_up_required ? (
                                                        <span className="text-amber-600 font-medium">Required</span>
                                                    ) : (
                                                        <span className="text-gray-400">No</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">{call.call_duration || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            {/* Mobile View - Cards */}
                            <div className="lg:hidden space-y-4">
                                {selectedBatch.calls?.map((call, idx) => (
                                    <div key={idx} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="font-bold text-gray-900">{call.customer_name}</h4>
                                                <p className="text-sm text-gray-500">{call.phone_number}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                call.call_status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                call.call_status === 'Failed' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {call.call_status || 'Pending'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-gray-500 block text-xs">Outcome</span>
                                                <span className="font-medium text-gray-900">{call.call_outcome || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Interest</span>
                                                <span className="font-medium text-gray-900">{call.customer_interest || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Duration</span>
                                                <span className="font-medium text-gray-900">{call.call_duration || '-'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block text-xs">Follow-up</span>
                                                <span className={`font-medium ${call.follow_up_required ? 'text-amber-600' : 'text-gray-900'}`}>
                                                    {call.follow_up_required ? 'Required' : 'No'}
                                                </span>
                                            </div>
                                        </div>
                                        {call.conversation && (
                                            <div className="mt-3 pt-3 border-t border-gray-100">
                                                <span className="text-gray-500 block text-xs mb-1">Feedback Notes</span>
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{call.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="p-5 border-t border-gray-100 bg-white flex justify-end">
                            <button 
                                onClick={() => setSelectedBatch(null)}
                                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                        
                    </div>
                </div>
            )}
        </div>
    );
};
