package com.realestate.duediligence.integration.common;

import java.util.Set;

/**
 * Central catalog of Indian cities supported by the mock providers.
 *
 * Used by every mock provider to decide:
 *   - Return realistic mock data → city is Indian
 *   - Return NO_DATA with honest reason → city is not Indian
 *
 * This prevents mocks from generating misleading fake data
 * (e.g., "Boston Municipal Corp" for a US city).
 */
public final class IndianCityCatalog {

    private IndianCityCatalog() {} // utility class

    private static final Set<String> INDIAN_CITIES = Set.of(
            "bangalore", "bengaluru",
            "mumbai", "bombay",
            "delhi", "new delhi",
            "chennai", "madras",
            "hyderabad",
            "pune",
            "kolkata", "calcutta",
            "ahmedabad",
            "jaipur",
            "lucknow",
            "kanpur",
            "nagpur",
            "indore",
            "thane",
            "bhopal",
            "visakhapatnam", "vizag",
            "patna",
            "vadodara",
            "ghaziabad",
            "ludhiana",
            "agra",
            "nashik",
            "faridabad",
            "meerut",
            "rajkot",
            "kalyan",
            "vasai",
            "varanasi",
            "srinagar",
            "aurangabad",
            "dhanbad",
            "amritsar",
            "navi mumbai",
            "allahabad", "prayagraj",
            "howrah",
            "ranchi",
            "gwalior",
            "jabalpur",
            "coimbatore",
            "vijayawada",
            "jodhpur",
            "madurai",
            "raipur",
            "kota",
            "chandigarh",
            "guwahati",
            "solapur",
            "hubli", "hubballi",
            "mysore", "mysuru",
            "tiruchirappalli", "trichy",
            "bareilly",
            "aligarh",
            "moradabad",
            "jalandhar",
            "bhubaneswar",
            "salem",
            "warangal",
            "mira bhayandar",
            "thiruvananthapuram", "trivandrum",
            "bhiwandi",
            "saharanpur",
            "guntur",
            "amravati",
            "bikaner",
            "noida",
            "jamshedpur",
            "bhilai",
            "cuttack",
            "firozabad",
            "kochi", "cochin",
            "nellore",
            "bhavnagar",
            "dehradun",
            "durgapur",
            "asansol",
            "rourkela",
            "nanded",
            "kolhapur",
            "ajmer",
            "gulbarga", "kalaburagi",
            "jamnagar",
            "ujjain",
            "loni",
            "siliguri",
            "jhansi",
            "ulhasnagar",
            "jammu",
            "sangli",
            "mangalore", "mangaluru",
            "erode",
            "belgaum", "belagavi",
            "ambattur",
            "tirunelveli",
            "malegaon",
            "gaya",
            "jalgaon",
            "udaipur",
            "maheshtala",
            "gurgaon", "gurugram"
    );

    /** Case-insensitive check whether the city is a known Indian city. */
    public static boolean isIndian(String city) {
        if (city == null || city.isBlank()) return false;
        return INDIAN_CITIES.contains(city.trim().toLowerCase());
    }

    /** Standard reason string when a mock provider skips a non-Indian city. */
    public static String nonIndianReason() {
        return "This platform currently covers Indian cities only. " +
               "Data providers (land registry, tax, zoning, permits) are region-specific.";
    }
}