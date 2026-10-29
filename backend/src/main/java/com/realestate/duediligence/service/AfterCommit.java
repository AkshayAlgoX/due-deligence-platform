package com.realestate.duediligence.service;

import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Defers a side effect until the surrounding transaction has committed.
 *
 * Used for notification emails: an email must not go out for data the
 * transaction later rolls back, and the async listener must not race the
 * still-open transaction for the same rows. Outside a transaction the
 * action runs immediately.
 *
 * The action runs after the commit, so any transactional work it does
 * must happen on another thread or in a new transaction (the @Async
 * listener satisfies this).
 */
public final class AfterCommit {

    private AfterCommit() {}

    public static void run(Runnable action) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    action.run();
                }
            });
        } else {
            action.run();
        }
    }
}
