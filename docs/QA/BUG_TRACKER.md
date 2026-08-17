# Quality Assurance Bug Tracker

**Project**: Real Estate Due Diligence Platform  
**QA Lead**: Member 6  
**Last Updated**: August 14, 2026  

---

## 1. Summary Metrics

| Total Bugs Tracked | Resolved / Fixed | Pending / External | Status |
| :---: | :---: | :---: | :---: |
| **5** | **5** | **0** | **100% Fixed** |

---

## 2. Bug Log & Remediation Details

### BUG-001: PropertyCard Lacked Keyboard Activation (Enter/Space)
- **Component**: `frontend/src/components/property/PropertyCard.jsx`
- **Severity**: High (Accessibility / Usability)
- **Reproduction Steps**: Focus PropertyCard using Tab key and press `Enter` or `Space`.
- **Expected Behavior**: Card triggers `onSelect` callback and opens property details.
- **Actual Behavior**: Nothing happened because outer element was an un-focusable `motion.div` without keydown listener.
- **Fix Applied**: Added `role="button"`, `tabIndex={0}`, `aria-label`, and `onKeyDown` handler for `Enter`/`Space`.
- **Status**: ✅ **VERIFIED FIXED**

### BUG-002: Missing Focus Visible Outline on Risk Factor Accordion Header
- **Component**: `frontend/src/components/risk/RiskFactorCard.jsx`
- **Severity**: Medium (Accessibility)
- **Reproduction Steps**: Navigate to Risk Analysis page, tab to RiskFactorCard accordion header button.
- **Expected Behavior**: Clear, high-contrast focus outline is visible.
- **Actual Behavior**: Focus ring was suppressed by `focus:outline-none` without replacement ring.
- **Fix Applied**: Added `focus-visible:ring-2 focus-visible:ring-[#22C55E]/50 focus-visible:ring-offset-2` styling.
- **Status**: ✅ **VERIFIED FIXED**

### BUG-003: Vitest Import Analysis Syntax Error for JSX in `.js` App Router Files
- **Component**: `frontend/vitest.config.js`
- **Severity**: High (Build / Testing Infrastructure)
- **Reproduction Steps**: Run `npm run test:run` against Next.js App Router page components defined in `.js` files.
- **Expected Behavior**: Vitest parses JSX inside `.js` files seamlessly.
- **Actual Behavior**: Vitest threw `Failed to parse source for import analysis because the content contains invalid JS syntax`.
- **Fix Applied**: Updated `vitest.config.js` to include `esbuild: { loader: "jsx", include: /\.jsx?$/ }` and `configDefaults.exclude`.
- **Status**: ✅ **VERIFIED FIXED**

### BUG-004: i18next Mock Object Render Exception in AuditLogTable & ReportHistory
- **Component**: `frontend/src/test/setup.js`
- **Severity**: Medium (Testing Infrastructure)
- **Reproduction Steps**: Render `AuditLogTable` with `i18n` options parameter containing `{ defaultValue }`.
- **Expected Behavior**: Translation hook returns a string.
- **Actual Behavior**: Mock returned object `{ defaultValue: ... }` directly into React DOM tree, raising `Objects are not valid as a React child`.
- **Fix Applied**: Enhanced `react-i18next` mock in `setup.js` to extract `defaultValue.defaultValue` string when options object is passed.
- **Status**: ✅ **VERIFIED FIXED**

### BUG-005: Playwright Spec File Interference in Vitest Test Runner
- **Component**: `frontend/vitest.config.js` & `frontend/src/__tests__/e2e/`
- **Severity**: Medium (Test Execution)
- **Reproduction Steps**: Run `npm test` when `src/__tests__/e2e/` contains `@playwright/test` specs using `test.describe()`.
- **Expected Behavior**: Vitest runs unit tests; Playwright runs E2E tests independently.
- **Actual Behavior**: Vitest attempted to run Playwright files, causing `@playwright/test` initialization errors.
- **Fix Applied**: Added `"src/__tests__/e2e/**"` to `vitest.config.js` test exclude list.
- **Status**: ✅ **VERIFIED FIXED**
