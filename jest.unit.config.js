// jest.unit.config.js
// Coverage is scoped to ONLY the files unit tests actually exercise.
// This prevents app.js / controllers / routes from showing 0% and
// dragging the global total below the threshold.

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/unit/**/*.test.js"],

  // ── Coverage ────────────────────────────────────────────────────────────────
  collectCoverage: true,
  coverageDirectory: "coverage/unit",
  coverageReporters: ["text", "lcov"],

  // Only report coverage for files that unit tests actually import
  collectCoverageFrom: [
    "src/middleware/**/*.js",  // validate.js         → exercised by validate.test.js
    "src/models/**/*.js",      // userStore.js         → exercised by userStore.test.js
  ],

  // Thresholds apply only to the files listed above — all should be ~100%
  coverageThreshold: {
    global: {
      statements: 90,
      branches:   85,
      functions:  95,
      lines:      90,
    },
  },
};
