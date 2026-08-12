package com.realestate.duediligence.exception;

/**
 * Thrown when a FREE-plan user attempts to generate more reports
 * than their monthly allowance.
 */
public class PlanLimitExceededException extends RuntimeException {

    public PlanLimitExceededException(String message) {
        super(message);
    }
}
