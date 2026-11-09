/** @type {import("@commitlint/types").UserConfig} */
export default {
  // Keep the Conventional Commits base rules
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Only these type prefixes, matching the sections of the changelog
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "refactor", "perf", "docs", "test", "build", "ci", "chore", "revert"],
    ],
    // A long subject gets truncated in commit lists and the pull request view
    "header-max-length": [2, "always", 72],
    // Case rules do not apply to commit messages written without Latin script
    "subject-case": [0],
    "scope-case": [0],
  },
  // Merge commits, reverts and dependency bots pass through
  ignores: [
    (message) => /^Merge /.test(message),
    (message) => /^Revert /.test(message),
    (message) => /^chore\(deps\)/.test(message),
  ],
};
