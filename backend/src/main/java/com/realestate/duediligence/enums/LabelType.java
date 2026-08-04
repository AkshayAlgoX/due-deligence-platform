package com.realestate.duediligence.enums;

public enum LabelType {
    NEW,           // Auto: Listed < 7 days
    HOT,           // Auto: 50+ views in last 3 days
    PRICE_DROP,    // Auto: Price reduced in last 14 days
    FEATURED,      // Manual: Admin sets
    VERIFIED,      // Auto: Documents verified
    SOLD,          // Auto: Property status = SOLD
    UNDER_OFFER,   // Manual: Admin sets
    PREMIUM        // Manual: Admin sets (top-tier)
}