import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, X, Play, RefreshCw, AlertTriangle, Image as ImageIcon, CheckCircle2, Edit2, Save } from 'lucide-react';
import { callService, CustomerCall, CallBatch, CallSummary } from '../../services/callService';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface EditableCustomer extends CustomerCall {
    selected: boolean;
    isEditing: boolean;
    validationStatus: 'Valid' | 'Invalid' | 'Duplicate';
    validationMessage?: string;
    tempName?: string;
    tempPhone?: string;
}

export const CustomerCallsTab: React.FC = () => {
    const [summary, setSummary] = useState<CallSummary | null>(null);
    const [images, setImages] = useState<File[]>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [customers, setCustomers] = useState<EditableCustomer[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [activeBatch, setActiveBatch] = useState<CallBatch | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const loadSummary = async () => {
        try {
            const data = await callService.getCallSummary();
            setSummary(data);
        } catch (err) {
            console.error("Failed to load summary", err);
        }
    };

    const loadActiveBatch = async () => {
        try {
            const batches = await callService.getCallBatches();
            const active = batches.find(b => b.status === 'In Progress');
            if (active) {
                const fullBatch = await callService.getCallBatch(active.id);
                setActiveBatch(fullBatch);
            } else {
                setActiveBatch(null);
            }
        } catch (err) {
            console.error("Failed to load active batch", err);
        }
    };

    useEffect(() => {
        loadSummary();
        loadActiveBatch();
        
        const interval = setInterval(() => {
            loadActiveBatch();
        }, 5000);
        
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        return () => {
            imageUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [imageUrls]);

    // Validate a single phone number
    const validatePhone = (phone: string): boolean => {
        // Basic Indian phone validation: 10 digits, optionally starting with +91 or 0
        const clean = phone.replace(/[\s-]/g, '');
        return /^(\+91|0)?[6-9]\d{9}$/.test(clean);
    };

    // Update validation statuses for all customers
    const updateValidations = (list: EditableCustomer[]): EditableCustomer[] => {
        const phoneCounts = new Map<string, number>();
        
        list.forEach(c => {
            const cleanPhone = c.phone_number.replace(/[\s-]/g, '');
            phoneCounts.set(cleanPhone, (phoneCounts.get(cleanPhone) || 0) + 1);
        });

        return list.map(c => {
            const cleanPhone = c.phone_number.replace(/[\s-]/g, '');
            const isDuplicate = (phoneCounts.get(cleanPhone) || 0) > 1;
            const isValidPhone = validatePhone(c.phone_number);
            
            let status: 'Valid' | 'Invalid' | 'Duplicate' = 'Valid';
            let msg = '';
            
            if (!c.customer_name.trim() || !c.phone_number.trim()) {
                status = 'Invalid';
                msg = 'Missing required info';
            } else if (!isValidPhone) {
                status = 'Invalid';
                msg = 'Invalid Indian number';
            } else if (isDuplicate) {
                status = 'Duplicate';
                msg = 'Duplicate phone number';
            }

            return { ...c, validationStatus: status, validationMessage: msg };
        });
    };

    const processFiles = (filesArray: File[]) => {
        setError(null);
        
        const validFiles = filesArray.filter(file => {
            if (!file.type.startsWith('image/')) return false;
            if (file.size > MAX_FILE_SIZE) {
                setError(`File ${file.name} exceeds 5MB limit.`);
                return false;
            }
            return true;
        });
        
        if (validFiles.length !== filesArray.length && !error) {
            setError("Only image files (JPEG, PNG) under 5MB are supported.");
        }
        
        if (images.length + validFiles.length > 3) {
            setError("You can only upload up to 3 images at a time.");
            return;
        }
        
        const newFiles = validFiles.slice(0, 3 - images.length);
        setImages(prev => [...prev, ...newFiles]);
        setImageUrls(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            processFiles(Array.from(e.target.files));
        }
    };

    // Drag and drop handlers
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            processFiles(Array.from(e.dataTransfer.files));
        }
    }, [images]);

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageUrls(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleExtract = async () => {
        if (images.length === 0) return;
        
        setIsProcessing(true);
        setError(null);
        try {
            const result = await callService.uploadCustomerImages(images);
            const editable: EditableCustomer[] = result.customers.map((c: CustomerCall) => ({
                ...c,
                selected: true,
                isEditing: false,
                validationStatus: 'Valid',
                validationMessage: ''
            }));
            setCustomers(updateValidations(editable));
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to process images.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStartCalls = async () => {
        const selectedToCall = customers.filter(c => c.selected && c.validationStatus === 'Valid');
        if (selectedToCall.length === 0) {
            setError("No valid customers selected to call.");
            return;
        }
        
        if (activeBatch) {
            setError("Calls are already in progress.");
            return;
        }
        
        setIsStarting(true);
        setError(null);
        try {
            // Strip UI-only fields
            const cleanCustomers = selectedToCall.map(({ selected, isEditing, validationStatus, validationMessage, tempName, tempPhone, ...rest }) => rest);
            const batch = await callService.createCallBatch(cleanCustomers);
            await callService.startCallBatch(batch.id);
            setCustomers([]);
            setImages([]);
            imageUrls.forEach(url => URL.revokeObjectURL(url));
            setImageUrls([]);
            await loadActiveBatch();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Failed to start calls.");
        } finally {
            setIsStarting(false);
        }
    };

    const toggleSelectAll = () => {
        const allSelected = customers.every(c => c.selected);
        setCustomers(prev => prev.map(c => ({ ...c, selected: !allSelected })));
    };

    const toggleSelect = (idx: number) => {
        setCustomers(prev => {
            const copy = [...prev];
            copy[idx].selected = !copy[idx].selected;
            return copy;
        });
    };

    const handleEditStart = (idx: number) => {
        setCustomers(prev => {
            const copy = [...prev];
            copy[idx].isEditing = true;
            copy[idx].tempName = copy[idx].customer_name;
            copy[idx].tempPhone = copy[idx].phone_number;
            return copy;
        });
    };

    const handleEditSave = (idx: number) => {
        setCustomers(prev => {
            const copy = [...prev];
            copy[idx].isEditing = false;
            copy[idx].customer_name = copy[idx].tempName || '';
            copy[idx].phone_number = copy[idx].tempPhone || '';
            return updateValidations(copy);
        });
    };

    const handleEditCancel = (idx: number) => {
        setCustomers(prev => {
            const copy = [...prev];
            copy[idx].isEditing = false;
            return copy;
        });
    };

    const handleRemoveCustomer = (idx: number) => {
        setCustomers(prev => updateValidations(prev.filter((_, i) => i !== idx)));
    };

    const validSelectedCount = customers.filter(c => c.selected && c.validationStatus === 'Valid').length;
    const hasDuplicates = customers.some(c => c.validationStatus === 'Duplicate');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-clay-900">Customer Calls</h2>
            </div>
            
            {/* Summary */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border border-sand-200 shadow-warm-sm">
                        <p className="text-xs text-clay-500 uppercase font-semibold">Today's Calls</p>
                        <p className="text-2xl font-bold text-clay-900">{summary.total}</p>
                    </div>
                    <div className="bg-sage-50 p-4 rounded-xl border border-sage-200 shadow-warm-sm">
                        <p className="text-xs text-sage-700 uppercase font-semibold">Completed</p>
                        <p className="text-2xl font-bold text-sage-700">{summary.completed}</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-warm-sm">
                        <p className="text-xs text-amber-700 uppercase font-semibold">Pending / Interested</p>
                        <p className="text-2xl font-bold text-amber-700">{summary.pending} / {summary.interested}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl border border-red-200 shadow-warm-sm">
                        <p className="text-xs text-red-700 uppercase font-semibold">Failed / No Answer</p>
                        <p className="text-2xl font-bold text-red-700">{summary.failed} / {summary.no_answer}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-center gap-2 border border-red-200">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">{error}</span>
                </div>
            )}

            {/* Upload Area */}
            {!activeBatch && customers.length === 0 && (
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-sand-200 shadow-warm-sm">
                    <h3 className="text-lg font-bold text-clay-900 mb-4">Upload Customer Images</h3>
                    <div 
                        className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-colors cursor-pointer
                            ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-sand-300 hover:bg-cream-200/50'}`}
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/jpeg, image/png, image/jpg" 
                            multiple
                            onChange={handleFileChange}
                        />
                        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-amber-500' : 'text-clay-400'}`} />
                        <p className="text-clay-800 font-semibold text-lg">Click to browse or drag and drop</p>
                        <p className="text-sm text-clay-500 mt-2">JPEG, JPG, PNG up to 5MB (Max 3 images per batch)</p>
                    </div>

                    {images.length > 0 && (
                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-clay-900 mb-4">Selected Images ({images.length}/3)</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {images.map((file, idx) => (
                                    <div key={idx} className="relative group border border-sand-200 rounded-xl overflow-hidden bg-cream-200 aspect-video flex items-center justify-center">
                                        <img src={imageUrls[idx]} alt={file.name} className="object-cover w-full h-full" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                            className="absolute top-2 right-2 bg-white/90 p-1.5 rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-white/95 px-3 py-2 text-xs truncate font-semibold text-clay-900 border-t border-sand-100">
                                            {file.name}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 flex justify-end">
                                <button 
                                    onClick={handleExtract}
                                    disabled={isProcessing}
                                    className="bg-amber-500 text-slate-950 px-6 py-3 rounded-xl font-bold hover:bg-amber-400 shadow-md disabled:opacity-70 flex items-center gap-2 transition-all"
                                >
                                    {isProcessing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                    {isProcessing ? "Processing Images..." : "Extract Customers"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Review Customers Table */}
            {customers.length > 0 && !activeBatch && (
                <div className="space-y-4">
                    {hasDuplicates && (
                        <div className="bg-amber-50 text-amber-800 p-3 rounded-lg border border-amber-200 flex items-center gap-2 text-sm font-medium">
                            <AlertTriangle className="w-5 h-5" />
                            Warning: Duplicate phone numbers detected. Please review and remove duplicates before starting.
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-sand-200 shadow-warm-sm overflow-hidden">
                        <div className="p-5 sm:p-6 border-b border-sand-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-clay-900">Review Extracted Customers</h3>
                                <p className="text-sm text-clay-500 mt-1">Found {customers.length} customers. Please verify details.</p>
                            </div>
                            <button 
                                onClick={handleStartCalls}
                                disabled={isStarting || validSelectedCount === 0}
                                className="bg-sage-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-sage-500 shadow-md disabled:opacity-60 flex items-center justify-center gap-2 transition-all"
                            >
                                {isStarting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                                {isStarting ? "Starting..." : `Start ${validSelectedCount} Calls`}
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-cream-200 text-clay-600 border-b border-sand-200">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-center w-12">
                                            <input 
                                                type="checkbox" 
                                                checked={customers.length > 0 && customers.every(c => c.selected)}
                                                onChange={toggleSelectAll}
                                                className="rounded text-amber-500 bg-white border-sand-300 focus:ring-amber-500 cursor-pointer"
                                            />
                                        </th>
                                        <th className="px-4 py-3 font-semibold">Customer Name</th>
                                        <th className="px-4 py-3 font-semibold">Phone Number</th>
                                        <th className="px-4 py-3 font-semibold">Extraction</th>
                                        <th className="px-4 py-3 font-semibold">Validation</th>
                                        <th className="px-4 py-3 font-semibold">Source</th>
                                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-sand-100">
                                    {customers.map((c, idx) => (
                                        <tr key={idx} className={`hover:bg-cream-50 transition-colors ${!c.selected ? 'opacity-60' : ''} ${c.validationStatus === 'Duplicate' ? 'bg-amber-50/30' : ''}`}>
                                            <td className="px-4 py-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    checked={c.selected}
                                                    onChange={() => toggleSelect(idx)}
                                                    className="rounded text-amber-500 bg-white border-sand-300 focus:ring-amber-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="px-4 py-4 font-medium text-clay-900">
                                                {c.isEditing ? (
                                                    <input 
                                                        type="text" 
                                                        value={c.tempName}
                                                        onChange={(e) => {
                                                            const copy = [...customers];
                                                            copy[idx].tempName = e.target.value;
                                                            setCustomers(copy);
                                                        }}
                                                        className="w-full px-2 py-1 bg-white border border-sand-300 rounded-md focus:border-amber-500 focus:outline-none"
                                                    />
                                                ) : c.customer_name}
                                            </td>
                                            <td className="px-4 py-4 text-clay-700 font-mono">
                                                {c.isEditing ? (
                                                    <input 
                                                        type="text" 
                                                        value={c.tempPhone}
                                                        onChange={(e) => {
                                                            const copy = [...customers];
                                                            copy[idx].tempPhone = e.target.value;
                                                            setCustomers(copy);
                                                        }}
                                                        className="w-full px-2 py-1 bg-white border border-sand-300 rounded-md focus:border-amber-500 focus:outline-none"
                                                    />
                                                ) : c.phone_number}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                                                    c.extraction_status === 'Success' ? 'text-sage-700 bg-sage-50' :
                                                    c.extraction_status === 'Partial' ? 'text-amber-700 bg-amber-50' :
                                                    'text-clay-600 bg-sand-200'
                                                }`}>
                                                    {c.extraction_status || 'Success'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                {c.validationStatus === 'Valid' ? (
                                                    <span className="inline-flex items-center gap-1 text-sage-600 text-xs font-bold bg-sage-50 px-2 py-1 rounded-md">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                                                    </span>
                                                ) : (
                                                    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${c.validationStatus === 'Duplicate' ? 'text-amber-700 bg-amber-100' : 'text-red-700 bg-red-100'}`}>
                                                        <AlertTriangle className="w-3.5 h-3.5" /> {c.validationMessage}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-clay-500 text-xs truncate max-w-[150px]">
                                                {c.source_image}
                                            </td>
                                            <td className="px-4 py-4 text-right space-x-2">
                                                {c.isEditing ? (
                                                    <>
                                                        <button onClick={() => handleEditSave(idx)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Save">
                                                            <Save className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleEditCancel(idx)} className="p-1 text-gray-500 hover:bg-gray-100 rounded" title="Cancel">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button onClick={() => handleEditStart(idx)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button onClick={() => handleRemoveCustomer(idx)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Remove">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Batch Progress (Unchanged Logic, Updated UI) */}
            {activeBatch && (
                <div className="bg-white rounded-2xl border border-sand-200 shadow-warm-sm overflow-hidden">
                    <div className="bg-amber-100 border-b border-amber-200 p-2 text-center text-xs font-bold text-amber-800 uppercase tracking-widest flex items-center justify-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        Development Mock Mode Active - No real calls are being placed
                    </div>
                    <div className="p-5 sm:p-6 border-b border-sand-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-clay-900">{activeBatch.batch_name}</h3>
                                <p className="text-sm text-clay-500 mt-1">Status: <span className="font-bold text-amber-500">{activeBatch.status}</span></p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-clay-600 bg-cream-200 px-4 py-2 rounded-xl border border-sand-200">
                                <div>Completed: <span className="font-bold text-sage-600">{activeBatch.completed_calls}</span></div>
                                <div>Failed: <span className="font-bold text-red-600">{activeBatch.failed_calls}</span></div>
                                <div>Total: <span className="font-bold text-clay-900">{activeBatch.total_customers}</span></div>
                            </div>
                        </div>
                        
                        <div className="w-full bg-sand-200 rounded-full h-3 mb-2 overflow-hidden shadow-inner">
                            <div 
                                className="bg-amber-400 h-3 rounded-full transition-all duration-700 ease-out" 
                                style={{ width: `${(activeBatch.completed_calls + activeBatch.failed_calls) / Math.max(1, activeBatch.total_customers) * 100}%` }}
                            ></div>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-cream-200 text-clay-600 border-b border-sand-200">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Customer</th>
                                    <th className="px-6 py-3 font-semibold">Phone</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Outcome</th>
                                    <th className="px-6 py-3 font-semibold">Duration</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sand-100">
                                {activeBatch.calls.map(c => (
                                    <tr key={c.id} className="hover:bg-cream-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-clay-900">{c.customer_name}</td>
                                        <td className="px-6 py-4 text-clay-600 font-mono">{c.phone_number}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${
                                                c.call_status === 'Completed' ? 'bg-sage-100 text-sage-700' :
                                                c.call_status === 'Calling' ? 'bg-amber-100 text-amber-700 animate-pulse' :
                                                c.call_status === 'Failed' || c.call_status === 'No Answer' ? 'bg-red-100 text-red-700' :
                                                'bg-sand-200 text-clay-600'
                                            }`}>
                                                {c.call_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${
                                                c.call_outcome === 'Interested' ? 'text-sage-600' :
                                                c.call_outcome === 'Not Interested' ? 'text-red-500' :
                                                c.call_outcome === 'Follow-up' ? 'text-amber-500' :
                                                'text-clay-500'
                                            }`}>
                                                {c.call_outcome || '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-clay-500 font-mono text-xs">
                                            {c.call_duration ? c.call_duration : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};
