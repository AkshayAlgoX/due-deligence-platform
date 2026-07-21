package com.realestate.duediligence.integration.ownership;

import com.realestate.duediligence.integration.common.PropertyInfoProvider;

/**
 * Provider for ownership + land registry data.
 *
 * Real-world sources (when available):
 *   - Karnataka Bhoomi (RTC records)
 *   - Maharashtra 7/12 extract
 *   - Delhi DORIS
 *
 * Current implementation: MockOwnershipProvider
 */
public interface OwnershipProvider extends PropertyInfoProvider<OwnershipRecord> {
}