---
'@open-cells/core-plugin': patch
---

Pin internal dependency on `@open-cells/core` to an exact version instead of a caret range. Caret ranges combined with prerelease (`-rc.x`) versions only match the same `[major, minor, patch]` tuple, so bumping `@open-cells/core` to a different patch/minor while still in prerelease silently stopped satisfying `^1.2.0-rc.0`, causing npm to install a second, duplicate copy of `@open-cells/core` for consumers.
