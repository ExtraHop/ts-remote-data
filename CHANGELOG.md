# Changelog

## 1.1.0 (May 22, 2019)

### New Features

- Add `RemoteData.isSettled` and `RemoteData.asSettled` to work with values that are ready or have failed.
- Add `RemoteData.recover` to convert a failure into a ready fallback value while leaving `NOT_ASKED` and `LOADING` intact.

## 1.0.1 (May 3, 2019)

### Fixes

- `RemoteData.isFailure` no longer throws an error when passed `null` [#4](https://github.com/ExtraHop/ts-remote-data/issues/4)