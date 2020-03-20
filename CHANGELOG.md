# Changelog

## 1.1.4 (Mar 20, 2020)

### Fixes

- The default export from the library is no longer an empty object. This issue was caused by an incorrect build configuration introduced in 1.1.1.

## 1.1.3 (Feb 25, 2020)

### Fixes

- Added back missing TypeScript declaration files (broken in 1.1.1) [#9](https://github.com/ExtraHop/ts-remote-data/issues/9)

## 1.1.2 (Aug 13, 2019)

### Fixes

- Upgraded Lodash from 4.17.11 to 4.17.14 to handle vulnerability [CVE-2019-10744](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-10744)

## 1.1.1 (Jun 4, 2019)

### Fixes

- The JavaScript code is now compiled as ES5, so that it works in older browsers

## 1.1.0 (May 22, 2019)

### New Features

- Add `RemoteData.isSettled` and `RemoteData.asSettled` to work with values that are ready or have failed.
- Add `RemoteData.recover` to convert a failure into a ready fallback value while leaving `NOT_ASKED` and `LOADING` intact.

## 1.0.1 (May 3, 2019)

### Fixes

- `RemoteData.isFailure` no longer throws an error when passed `null` [#4](https://github.com/ExtraHop/ts-remote-data/issues/4)