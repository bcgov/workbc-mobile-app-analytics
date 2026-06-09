-- WorkBC mobile analytics — events table (dev)
BEGIN;

CREATE SCHEMA IF NOT EXISTS analytics;

DROP TABLE IF EXISTS analytics.events CASCADE;

CREATE TABLE analytics.events (
    id                   UUID        PRIMARY KEY,
    event_name           TEXT        NOT NULL,
    session_id           UUID,
    platform             TEXT,
    client_occurred_at   TIMESTAMPTZ,
    is_authenticated     BOOLEAN,
    screen_name          TEXT,
    properties           JSONB       NOT NULL DEFAULT '{}'::jsonb,
    received_at          TIMESTAMPTZ NOT NULL,

    CONSTRAINT events_event_name_not_empty
        CHECK (char_length(btrim(event_name)) > 0),

    CONSTRAINT events_properties_is_object
        CHECK (jsonb_typeof(properties) = 'object'),

    CONSTRAINT events_platform_valid
        CHECK (platform IS NULL OR platform IN ('ios', 'android'))
);

COMMENT ON TABLE analytics.events IS
    'Append-only mobile analytics events from POST /v1/events';

COMMENT ON COLUMN analytics.events.id IS
    'Server-assigned UUID returned to the client in the 202 response';

COMMENT ON COLUMN analytics.events.event_name IS
    'Event type identifier, e.g. screen_view, button_click';

COMMENT ON COLUMN analytics.events.session_id IS
    'From properties.sessionId — groups events within a user session';

COMMENT ON COLUMN analytics.events.platform IS
    'From properties.platform — ios or android';

COMMENT ON COLUMN analytics.events.client_occurred_at IS
    'From properties.timestamp — when the event occurred on the device';

COMMENT ON COLUMN analytics.events.is_authenticated IS
    'From properties.isAuthenticated — parsed to boolean on insert';

COMMENT ON COLUMN analytics.events.screen_name IS
    'From properties.screenName — screen context when the event occurred (all event types)';

COMMENT ON COLUMN analytics.events.properties IS
    'Event-specific payload JSON, e.g. previousScreenName (screen_view), buttonId (button_click)';

COMMENT ON COLUMN analytics.events.received_at IS
    'Server timestamp when the event was accepted (API receivedAt)';

-- Time-range scans on server ingestion time
CREATE INDEX idx_events_received_at
    ON analytics.events (received_at DESC);

-- Filter by event type within a date range
CREATE INDEX idx_events_event_name_received_at
    ON analytics.events (event_name, received_at DESC);

-- User-behavior time ranges (prefer this for dashboards)
CREATE INDEX idx_events_client_occurred_at
    ON analytics.events (client_occurred_at DESC)
    WHERE client_occurred_at IS NOT NULL;

-- Session funnels
CREATE INDEX idx_events_session_id
    ON analytics.events (session_id, client_occurred_at)
    WHERE session_id IS NOT NULL;

-- Platform breakdowns
CREATE INDEX idx_events_platform_client_occurred_at
    ON analytics.events (platform, client_occurred_at DESC)
    WHERE platform IS NOT NULL;

-- Screen context across event types
CREATE INDEX idx_events_screen_name_client_occurred_at
    ON analytics.events (screen_name, client_occurred_at DESC)
    WHERE screen_name IS NOT NULL;

-- Flexible filters on event-specific keys, e.g. properties->>''buttonId''
CREATE INDEX idx_events_properties_gin
    ON analytics.events USING gin (properties);

COMMIT;
