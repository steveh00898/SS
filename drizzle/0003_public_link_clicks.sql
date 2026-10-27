CREATE TABLE public_link_clicks (
 day text NOT NULL,
 item_id text NOT NULL,
 kind text NOT NULL,
 click_count integer DEFAULT 0 NOT NULL,
 PRIMARY KEY (day, item_id, kind)
);
