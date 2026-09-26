import { api } from './api';

export interface CustomerCall {
    id?: number;
    customer_name: string;
    phone_number: string;
    source_image?: string;
    extraction_status?: string;
    call_status?: string;
    call_outcome?: string;
    conversation?: string;
    feedback?: string;
    customer_response?: string;
    agent_notes?: string;
    customer_interest?: string;
    follow_up_required?: boolean;
    follow_up_date?: string;
    follow_up_notes?: string;
    call_attempt_number?: number;
    call_start_time?: string;
    call_end_time?: string;
    call_duration?: string;
    recording_url?: string;
    transcript?: string;
}

export interface Customer {
    id: number;
    email: string;
    full_name: string;
    phone: string;
    role: string;
    address_json?: string;
    created_at: string;
}

export interface CallBatch {
    id: number;
    batch_name: string;
    batch_date: string;
    total_customers: number;
    completed_calls: number;
    failed_calls: number;
    status: string;
    google_sheet_id?: string;
    google_sheet_url?: string;
    google_sheet_tab_name?: string;
    google_sheet_tab_id?: string;
    agent_prompt?: string;
    calls: CustomerCall[];
}

export interface CallBatchCreate {
    customers: CustomerCall[];
    agent_prompt?: string;
}

export interface CallSummary {
    total: number;
    completed: number;
    pending: number;
    failed: number;
    no_answer: number;
    interested: number;
    follow_ups: number;
}

export const callService = {
    uploadCustomerImages: async (files: File[]): Promise<{ customers: CustomerCall[] }> => {
        const formData = new FormData();
        files.forEach(f => formData.append('files', f));
        
        const response = await api.post('/admin/customer-calls/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    createCallBatch: async (data: CallBatchCreate): Promise<CallBatch> => {
        const response = await api.post('/admin/customer-calls/batches', data);
        return response.data;
    },

    getCustomers: async (): Promise<Customer[]> => {
        const response = await api.get('/admin/customers');
        return response.data;
    },

    getCallBatches: async (): Promise<CallBatch[]> => {
        const response = await api.get('/admin/customer-calls/batches');
        return response.data;
    },

    getCallBatch: async (batchId: number): Promise<CallBatch> => {
        const response = await api.get(`/admin/customer-calls/batches/${batchId}`);
        return response.data;
    },

    startCallBatch: async (batchId: number): Promise<{ message: string }> => {
        const response = await api.post(`/admin/customer-calls/batches/${batchId}/start`);
        return response.data;
    },

    generateGoogleSheet: async (batchId: number): Promise<{ message: string, google_sheet_url: string, google_sheet_tab_name: string }> => {
        const response = await api.post(`/admin/customer-calls/batches/${batchId}/google-sheet`);
        return response.data;
    },
    
    getGoogleSheet: async (batchId: number): Promise<any> => {
        const response = await api.get(`/admin/customer-calls/batches/${batchId}/google-sheet`);
        return response.data;
    },

    getCallSummary: async (): Promise<CallSummary> => {
        const response = await api.get('/admin/customer-calls/summary');
        return response.data;
    }
};
