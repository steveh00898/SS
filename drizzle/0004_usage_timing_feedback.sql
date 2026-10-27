CREATE TABLE public_telemetry_events (event_id text PRIMARY KEY NOT NULL, day text NOT NULL, type text NOT NULL, item_id text, kind text, value integer);
CREATE INDEX public_telemetry_events_day ON public_telemetry_events(day);
CREATE TABLE public_feedback (id text PRIMARY KEY NOT NULL, created_at text NOT NULL, comment text NOT NULL);
CREATE INDEX public_feedback_created_at ON public_feedback(created_at);
