// frontend/src/constants/faq.js

/**
 * FAQ content for /support page.
 * Every answer is honest — no invented features, no roadmap items disguised as done.
 */

export const FAQ_ITEMS = [
  {
    category: "Getting started",
    question: "How do I add my first property?",
    answer:
      "After signing in, click 'Add property' in the top-right of the dashboard, or use the button in the property search page. Fill in the address — we'll auto-suggest matches from OpenStreetMap. Only address and city are required; everything else can be added later.",
  },
  {
    category: "Getting started",
    question: "What information do I need to add a property?",
    answer:
      "Required: address and city. Recommended: property type, market value, area (sqft), year built, and bedrooms/bathrooms. The more fields you fill in, the higher your verification score and the more accurate your risk assessment.",
  },
  {
    category: "Verification",
    question: "Why is my property marked as 'Pending' or 'Incomplete'?",
    answer:
      "We run 7 data quality checks on every property (address, city, state, ZIP, market value, area, property type). Missing any of these keeps the status as pending. Click 'Complete to verify' on any pending card to fill in the missing fields.",
  },
  {
    category: "Verification",
    question: "How does verification work?",
    answer:
      "Verification is automatic and based purely on data completeness — not manual review. When you fill in all 7 required fields, the property is marked verified. If you edit a verified property and remove a field, it goes back to pending.",
  },
  {
    category: "Risk scoring",
    question: "How is the risk score calculated?",
    answer:
      "The risk score is a weighted average of four categories: Financial (30%), Legal (30%), Environmental (25%), and Structural (15%). Each category has documented rules — for example, unverified status adds legal risk, high AQI adds environmental risk, condition 'Poor' adds structural risk. Score ranges: 0-33 Low, 34-66 Medium, 67-100 High. Full rules are documented in the source code.",
  },
  {
    category: "Risk scoring",
    question: "Why does my property show 'data incomplete' on the risk card?",
    answer:
      "Some data sources (like ownership, tax history, permits) currently return sample data because reliable public APIs for these domains are not yet available for India at scale. The risk engine flags this so you know the score would be more precise with real data.",
  },
  {
    category: "Data sources",
    question: "Where does the air quality data come from?",
    answer:
      "AQI values come from the WAQI (World Air Quality Index) API, which aggregates real-time readings from CPCB monitoring stations across India. If your property is in a city without a nearby station, this section will be marked as 'No data'.",
  },
  {
    category: "Data sources",
    question: "Is the ownership and tax data real?",
    answer:
      "No — we're upfront about this. The ownership, tax history, zoning, flood zone, and permits sections currently return sample data. Reliable public APIs for these domains don't yet exist in India at scale. Every card that shows sample data is clearly labelled 'Sample data' or 'Mock' in the interface.",
  },
  {
    category: "Reports & PDF",
    question: "How do I download a property report?",
    answer:
      "Open any property in property search, then click 'Download report' in the top-right of the property hero card. The PDF includes the property overview, risk assessment, all 6 data sections, and a data completeness summary. Generation takes 2-4 seconds.",
  },
  {
    category: "Reports & PDF",
    question: "Can I compare multiple properties in one report?",
    answer:
      "Yes. On the property search page, hover over any card and click the compare checkbox that appears. Select 2-3 properties, then click 'Compare' in the bottom bar. On the comparison page, click 'Download comparison' to get a landscape PDF with all properties side by side.",
  },
  {
    category: "Account",
    question: "How do I delete my account?",
    answer:
      "Go to your profile page and scroll to the danger zone at the bottom. Deleting your account is immediate and permanent — all your properties and history are removed from our database via cascade delete. There is no recovery period.",
  },
  {
    category: "Account",
    question: "I forgot my password. What do I do?",
    answer:
      "Click 'Forgot password' on the login page. Enter your registered email and we'll send a 6-digit OTP. Verify the OTP, then set a new password. OTPs are single-use and expire quickly. If you signed up with Google, use 'Continue with Google' instead — there is no password to reset.",
  },
  {
    category: "Privacy & security",
    question: "Is my data shared with third parties?",
    answer:
      "We call a small number of external services for specific purposes: WAQI for air quality (city name only), Nominatim for geocoding (address string only), and Google OAuth for sign-in verification. Full details are on our /security page. No personal or property data is sold to anyone.",
  },
  {
    category: "Privacy & security",
    question: "How are my passwords stored?",
    answer:
      "Passwords are hashed with BCrypt (strength factor 10) before being stored. We never see your plain-text password and cannot recover it — only reset it via OTP. If you sign in exclusively with Google, no password is stored at all.",
  },
];

export const FAQ_CATEGORIES = [
  "Getting started",
  "Verification",
  "Risk scoring",
  "Data sources",
  "Reports & PDF",
  "Account",
  "Privacy & security",
];