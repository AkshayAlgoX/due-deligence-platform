package com.realestate.duediligence.util;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;

/**
 * Centralized role checks for the RBAC matrix.
 *
 * Matrix summary:
 *   - ADMIN / LEGAL_REVIEWER / FINANCIAL_INSTITUTION can VIEW all properties
 *   - LEGAL_REVIEWER / FINANCIAL_INSTITUTION are "paid professional" roles:
 *     unlimited reports (no plan limits) and no consumer billing UI
 *   - Property WRITES (add/edit/delete) stay restricted to owners + ADMIN
 */
public final class RoleUtils {

    private RoleUtils() {
    }

    public static boolean isAdmin(User user) {
        return user != null
                && user.getRole() != null
                && user.getRole().getRoleName() != null
                && "ADMIN".equals(user.getRole().getRoleName().name());
    }

    /** LEGAL_REVIEWER or FINANCIAL_INSTITUTION — pro roles with unlimited access. */
    public static boolean isPaidProfessionalRole(User user) {
        if (user == null || user.getRole() == null || user.getRole().getRoleName() == null) {
            return false;
        }
        String role = user.getRole().getRoleName().name();
        return "LEGAL_REVIEWER".equals(role) || "FINANCIAL_INSTITUTION".equals(role);
    }

    /** ADMIN, LEGAL_REVIEWER and FINANCIAL_INSTITUTION see every property. */
    public static boolean canViewAllProperties(User user) {
        return isAdmin(user) || isPaidProfessionalRole(user);
    }

    /** Read access to a single property: owner, or a view-all role. */
    public static boolean canAccessProperty(User user, Property property) {
        if (canViewAllProperties(user)) {
            return true;
        }
        return user != null
                && property != null
                && property.getCreatedBy() != null
                && property.getCreatedBy().getId().equals(user.getId());
    }
}
