CREATE TABLE customer_call_batches (
    id SERIAL PRIMARY KEY,
    batch_name VARCHAR,
    batch_date TIMESTAMP,
    total_customers INTEGER DEFAULT 0,
    completed_calls INTEGER DEFAULT 0,
    failed_calls INTEGER DEFAULT 0,
    status VARCHAR DEFAULT 'Pending',
    google_doc_url VARCHAR,
    google_doc_id VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_customer_call_batches_id ON customer_call_batches (id);
CREATE INDEX ix_customer_call_batches_batch_name ON customer_call_batches (batch_name);

CREATE TABLE customer_calls (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES customer_call_batches(id) ON DELETE CASCADE,
    customer_name VARCHAR,
    phone_number VARCHAR,
    source_image VARCHAR,
    conversation TEXT,
    feedback TEXT,
    call_status VARCHAR DEFAULT 'Pending',
    call_outcome VARCHAR DEFAULT 'Pending',
    customer_response TEXT,
    agent_notes TEXT,
    customer_interest VARCHAR,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMP,
    follow_up_notes TEXT,
    call_attempt_number INTEGER DEFAULT 1,
    call_start_time TIMESTAMP WITH TIME ZONE,
    call_end_time TIMESTAMP WITH TIME ZONE,
    call_duration VARCHAR,
    recording_url VARCHAR,
    transcript TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ix_customer_calls_id ON customer_calls (id);
CREATE INDEX ix_customer_calls_batch_id ON customer_calls (batch_id);
CREATE INDEX ix_customer_calls_phone_number ON customer_calls (phone_number);
CREATE INDEX ix_customer_calls_call_status ON customer_calls (call_status);
CREATE INDEX ix_customer_calls_created_at ON customer_calls (created_at);
