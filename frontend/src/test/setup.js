// src/test/setup.js — global test environment setup
import React from "react";
import { beforeEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// ── In-memory storage mocks (reset before every test) ─────────────
function createMemoryStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(String(key)) ? store.get(String(key)) : null),
    setItem: (key, value) => store.set(String(key), String(value)),
    removeItem: (key) => store.delete(String(key)),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

const localStorageMock = createMemoryStorage();
const sessionStorageMock = createMemoryStorage();
vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("sessionStorage", sessionStorageMock);

beforeEach(() => {
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// ── window.matchMedia (jsdom lacks it) ────────────────────────────
window.matchMedia =
  window.matchMedia ||
  ((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

// ── IntersectionObserver / ResizeObserver ─────────────────────────
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

// ── next/navigation ───────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// ── next/link — render children as a plain anchor ─────────────────
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }) =>
    React.createElement(
      "a",
      { href: typeof href === "string" ? href : "#", ...rest },
      children
    ),
}));

// ── react-i18next — resolve t() to the provided default value ─────
vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key, defaultValue) => defaultValue ?? key }),
}));

// ── sonner toast ──────────────────────────────────────────────────
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

// ── framer-motion — MotionValue-aware mock (hooks + elements) ─────
vi.mock("framer-motion", () => {
  const makeMotionValue = (initial) => ({
    _v: initial,
    set(v) {
      this._v = v;
    },
    jump(v) {
      this._v = v;
    },
    get() {
      return this._v;
    },
    subscribe: () => () => {},
    on: () => () => {},
  });

  const useMotionValue = (v) => makeMotionValue(v);
  const useSpring = (source) => ({
    ...makeMotionValue(source.get()),
    set(v) {
      source.set(v);
    },
    get() {
      return source.get();
    },
  });
  const useTransform = (source, fn) => makeMotionValue(fn(source.get()));

  const toValue = (v) =>
    v && typeof v === "object" && typeof v.get === "function" && !React.isValidElement(v)
      ? v.get()
      : v;

  const motion = new Proxy(
    {},
    {
      get: (_, tag) => (props) => {
        const {
          initial,
          animate,
          exit,
          transition,
          whileHover,
          whileTap,
          whileFocus,
          whileInView,
          variants,
          layout,
          layoutId,
          ...rest
        } = props || {};
        const cleaned = {};
        for (const [k, v] of Object.entries(rest)) {
          if (k === "style" && v && typeof v === "object") {
            cleaned[k] = Object.fromEntries(
              Object.entries(v).map(([sk, sv]) => [sk, toValue(sv)])
            );
          } else {
            cleaned[k] = toValue(v);
          }
        }
        if ("children" in cleaned) {
          cleaned.children = Array.isArray(cleaned.children)
            ? cleaned.children.map(toValue)
            : toValue(cleaned.children);
        }
        return React.createElement(tag, cleaned);
      },
    }
  );

  return {
    motion,
    AnimatePresence: ({ children }) => children,
    useMotionValue,
    useSpring,
    useTransform,
    useScroll: () => ({
      scrollY: makeMotionValue(0),
      scrollYProgress: makeMotionValue(0),
    }),
    useInView: () => true,
  };
});
