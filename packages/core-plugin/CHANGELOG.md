# @open-cells/core-plugin

## 1.2.4

### Patch Changes

- Updated dependencies [fa9db76]
  - @open-cells/core@1.2.1

## 1.2.3

### Patch Changes

- 8db69be: Pin internal dependency on `@open-cells/core` to an exact version instead of a caret range. Caret ranges combined with prerelease (`-rc.x`) versions only match the same `[major, minor, patch]` tuple, so bumping `@open-cells/core` to a different patch/minor while still in prerelease silently stopped satisfying `^1.2.0-rc.0`, causing npm to install a second, duplicate copy of `@open-cells/core` for consumers.
- 3b59f3d: Event object used in postMessage with inconsistent properties
- Updated dependencies [c17c679]
- Updated dependencies [8fad9d7]
  - @open-cells/core@1.2.0

## 1.2.3-rc.2

### Patch Changes

- 8db69be: Pin internal dependency on `@open-cells/core` to an exact version instead of a caret range. Caret ranges combined with prerelease (`-rc.x`) versions only match the same `[major, minor, patch]` tuple, so bumping `@open-cells/core` to a different patch/minor while still in prerelease silently stopped satisfying `^1.2.0-rc.0`, causing npm to install a second, duplicate copy of `@open-cells/core` for consumers.
- Updated dependencies [8fad9d7]
  - @open-cells/core@1.2.0-rc.1

## 1.2.3-rc.1

### Patch Changes

- 3b59f3d: Event object used in postMessage with inconsistent properties

## 1.2.3-rc.0

### Patch Changes

- Updated dependencies [c17c679]
  - @open-cells/core@1.2.0-rc.0

## 1.2.2

### Patch Changes

- b9ced10: fix remove vulnerabilities
- Updated dependencies [3b7b960]
- Updated dependencies [b9ced10]
  - @open-cells/core@1.1.2

## 1.2.2-rc.1

### Patch Changes

- b9ced10: fix remove vulnerabilities
- Updated dependencies [b9ced10]
  - @open-cells/core@1.1.2-rc.1

## 1.2.2-rc.0

### Patch Changes

- Updated dependencies [3b7b960]
  - @open-cells/core@1.1.2-rc.0

## 1.2.1

### Patch Changes

- Updated dependencies [ce96d42]
  - @open-cells/core@1.1.1

## 1.2.1-rc.0

### Patch Changes

- Updated dependencies [ce96d42]
  - @open-cells/core@1.1.1-rc.0

## 1.2.0

### Minor Changes

- refactor core-plugin package

### Patch Changes

- Updated dependencies [ad6a9e5]
- Updated dependencies
  - @open-cells/core@1.1.0

## 1.2.0-rc.0

### Minor Changes

- refactor core-plugin package

### Patch Changes

- Updated dependencies
  - @open-cells/core@1.1.0-rc.0

## 1.1.1

### Patch Changes

- fix core declaration types
- Updated dependencies
  - @open-cells/core@1.0.1
