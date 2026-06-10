-- WorkBC mobile analytics — errors table (dev)
BEGIN;

CREATE SCHEMA IF NOT EXISTS analytics;

DROP TABLE IF EXISTS analytics.errors CASCADE;

CREATE TABLE analytics.errors (
    id                   UUID        PRIMARY KEY,
    error_type           TEXT        NOT NULL,
    error_name           TEXT        NOT NULL,
    error_message        TEXT        NOT NULL,
    session_id           UUID,
    platform             TEXT,
    client_occurred_at   TIMESTAMPTZ,
    component_stack      TEXT,
    properties           JSONB       NOT NULL DEFAULT '{}'::jsonb,
    received_at          TIMESTAMPTZ NOT NULL,

    CONSTRAINT errors_error_type_not_empty
        CHECK (char_length(btrim(error_type)) > 0),

    CONSTRAINT errors_error_name_not_empty
        CHECK (char_length(btrim(error_name)) > 0),

    CONSTRAINT errors_error_message_not_empty
        CHECK (char_length(btrim(error_message)) > 0),

    CONSTRAINT errors_properties_is_object
        CHECK (jsonb_typeof(properties) = 'object'),

    CONSTRAINT errors_platform_valid
        CHECK (platform IS NULL OR platform IN ('ios', 'android'))
);

COMMENT ON TABLE analytics.errors IS
    'Append-only mobile client errors from POST /v1/errors';

COMMENT ON COLUMN analytics.errors.id IS
    'Server-assigned UUID returned to the client in the 202 response';

COMMENT ON COLUMN analytics.errors.error_type IS
    'Error category from type, e.g. error_boundary';

COMMENT ON COLUMN analytics.errors.error_name IS
    'From errorName — e.g. TypeError';

COMMENT ON COLUMN analytics.errors.error_message IS
    'From errorMessage — full error message text';

COMMENT ON COLUMN analytics.errors.session_id IS
    'From sessionId — groups errors within a user session';

COMMENT ON COLUMN analytics.errors.platform IS
    'From platform — ios or android';

COMMENT ON COLUMN analytics.errors.client_occurred_at IS
    'From timestamp — when the error occurred on the device';

COMMENT ON COLUMN analytics.errors.component_stack IS
    'From componentStack — React component stack when available';

COMMENT ON COLUMN analytics.errors.properties IS
    'Extra client metadata not mapped to promoted columns';

COMMENT ON COLUMN analytics.errors.received_at IS
    'Server timestamp when the error was accepted (API receivedAt)';

-- Time-range scans on server ingestion time
CREATE INDEX idx_errors_received_at
    ON analytics.errors (received_at DESC);

-- Filter by error type within a date range
CREATE INDEX idx_errors_error_type_received_at
    ON analytics.errors (error_type, received_at DESC);

-- User-behavior time ranges (prefer this for dashboards)
CREATE INDEX idx_errors_client_occurred_at
    ON analytics.errors (client_occurred_at DESC)
    WHERE client_occurred_at IS NOT NULL;

-- Session correlation
CREATE INDEX idx_errors_session_id
    ON analytics.errors (session_id, client_occurred_at)
    WHERE session_id IS NOT NULL;

-- Platform breakdowns
CREATE INDEX idx_errors_platform_client_occurred_at
    ON analytics.errors (platform, client_occurred_at DESC)
    WHERE platform IS NOT NULL;

-- Flexible filters on extra metadata
CREATE INDEX idx_errors_properties_gin
    ON analytics.errors USING gin (properties);

COMMIT;
