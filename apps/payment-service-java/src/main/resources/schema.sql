CREATE TABLE IF NOT EXISTS balances
(
    user_id        UUID PRIMARY KEY,
    balance        NUMERIC(18, 2) NOT NULL DEFAULT 0,
    last_top_up TIMESTAMP,
    last_write_off  TIMESTAMP
);
