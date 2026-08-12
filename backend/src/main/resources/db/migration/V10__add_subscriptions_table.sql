-- V10: Subscriptions table for Cashfree payment integration
-- Plans: FREE (0, 3 reports/mo), PRO (49900 paise), BUSINESS (199900 paise), ENTERPRISE (custom)

CREATE TABLE IF NOT EXISTS subscriptions (
    id                      BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL,
    plan                    VARCHAR(20) NOT NULL,
    status                  VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    cashfree_order_id       VARCHAR(100),
    cashfree_payment_id     VARCHAR(100),
    amount                  BIGINT NOT NULL DEFAULT 0,
    currency                VARCHAR(10) NOT NULL DEFAULT 'INR',
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at              TIMESTAMP,
    cancelled_at            TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_user   ON subscriptions (user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_status ON subscriptions (status);
