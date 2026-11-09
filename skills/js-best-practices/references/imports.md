# Imports and bundle size

Covers how an import is written so unused code stays out of the bundle. Library choice is in [objects-and-collections.md](objects-and-collections.md), and runtime hot spots in [performance.md](performance.md).

Import only the part of a library that gets used, so the bundler can drop the rest:

- Named imports or subpaths: `import { groupBy } from "lodash-es"`, `lodash/groupBy`, `date-fns/format`, `@mui/icons-material/Delete`. A whole-package default import (`import _ from "lodash"`) puts all of it in the bundle.
- Large libraries of icons, components or charts usually publish dedicated entry points: import by component path, or register modules on demand the way `echarts/core` does, following the library's own documentation instead of importing from the package root.
- A CJS package is hard to shake out even when written carefully: without `sideEffects: false` the bundler does not dare drop anything. When the whole library shows up in the bundle, check these two points before changing how the import is written.
- The project's own modules are exempt: they still import through the module entry. A pure re-export barrel does not put unused code in the bundle; its cost is build time and circular dependencies.
- Importing on demand is not dynamic `import()`. A static named import only keeps unused code out; splitting a chunk uses dynamic `import()` or bundler configuration, split by route and by large feature rather than by function, or requests fragment and the first screen pays extra round trips.
