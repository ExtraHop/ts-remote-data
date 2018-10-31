// Establish constants for the different not-loaded states. Explicit types are
// used so these can be exported via `RemoteData` without being generalized
// to `string`.

const NOT_ASKED: 'RemoteData::NOT_ASKED' = 'RemoteData::NOT_ASKED';
const LOADING: 'RemoteData::LOADING' = 'RemoteData::LOADING';
const FAILURE_PROPERTY = 'RemoteData::FAILURE';

/**
 * A representation of an unsuccessful load of async data. Note that the
 * usage of `RemoteData` does not require that every failed data retrieval
 * update the state to be a failure; it is valid to preserve the last-seen
 * value instead.
 *
 * # Usage
 * Create an instance of this type using `RemoteData.failWith` to avoid
 * depending on the internal representation of the failure.
 */
export interface RemoteDataFailure {
    /**
     * Marker property that this object represents a `RemoteDataFailure`.
     * A namespaced string key is used for this to ensure compatibility with
     * Redux stores while minimizing the risk of collisions with user-defined
     * types.
     */
    [FAILURE_PROPERTY]: true;
    /**
     * The error encountered during data loading.
     */
    error: unknown;
}

/**
 * A snapshot point-in-time view of some data that will be asynchronously ready.
 * This can be used to represent the current state of a `Promise` in places that
 * require plain objects, or in places that need a view of an async operation
 * they are not a party to.
 *
 * Importantly, there is no runtime difference between a `RemoteData<T>` in the
 * "ready" state and a bare `T`. Therefore, any component can be converted from
 * accepting a `T` to accepting a `RemoteData<T>` without changing component
 * consumers.
 *
 * This is inspired by Elm's `RemoteData` enum type.
 */
type RemoteData<T> = typeof NOT_ASKED | typeof LOADING | RemoteDataFailure | T;

const RemoteData = {
    /**
     * Initial state for remote data. The client has not yet sent a request
     * to the server.
     */
    NOT_ASKED,
    /**
     * State when the client has started a request but not yet received a
     * response.
     */
    LOADING,
    /**
     * Create a failure object with no associated data.
     */
    fail: (): RemoteDataFailure => RemoteData.failWith(undefined),
    /**
     * State when the client has received a conclusive response from the server
     * that was an error. If a non-initial update fails, it is not required
     * that consumers of `RemoteData` overwrite the previous data with the
     * failure, but they may do so if it is contextually appropriate.
     */
    failWith: (error: unknown): RemoteDataFailure => ({
        [FAILURE_PROPERTY]: true,
        error,
    }),
    /**
     * State when the client has received a conclusive response from the server
     * that was an error. If a non-initial update fails, it is not required
     * that consumers of `RemoteData` overwrite the previous data with the
     * failure, but they may do so if it is contextually appropriate.
     */
    isFailure: <T>(rd: RemoteData<T>): rd is RemoteDataFailure =>
        typeof rd === 'object' &&
        Object.prototype.hasOwnProperty.bind(rd, FAILURE_PROPERTY)(),
    /**
     * Check if some remote data is available. This function acts as a type
     * guard; if it returns `true` then `remoteData` can now be used as a `T`.
     */
    isReady: <T>(remoteData: RemoteData<T>): remoteData is T =>
        remoteData !== NOT_ASKED &&
        remoteData !== LOADING &&
        !RemoteData.isFailure(remoteData),
    /**
     * Check if some remote data is ready; if so return it, otherwise return
     * `undefined`. This can be used with `||` to create a short-circuiting
     * default.
     */
    asReady: <T>(remoteData: RemoteData<T>): T | undefined =>
        RemoteData.isReady(remoteData) ? remoteData : undefined,
    /**
     * Check if some remote data has failed; if so, return the failure,
     * otherwise return `undefined`.
     */
    asFailure: <T>(rd: RemoteData<T>): RemoteDataFailure | undefined =>
        RemoteData.isFailure(rd) ? rd : undefined,
    /**
     * Get the value of some remote data if available, otherwise return a
     * specified fallback value.
     */
    getOr: <T>(remoteData: RemoteData<T>, fallback: T): T =>
        RemoteData.isReady(remoteData) ? remoteData : fallback,
    /**
     * Get the value of some remote data if available, otherwise throw an
     * exception.
     *
     * # Usage
     * When the caller is certain that code is only reachable after some
     * remote data is available, the value can be used by writing
     * `RemoteData.unwrap(rd).someRdMethod();`
     *
     * @throws `Error` if `remoteData` is not in the ready state.
     */
    unwrap: <T>(remoteData: RemoteData<T>): T | never => {
        if (RemoteData.isReady(remoteData)) return remoteData;
        throw new Error(`Attempted to unwrap ${remoteData}`);
    },
    /**
     * Return the first `RemoteData` in the 'ready' state.
     * This is used to kick off an initial data request but to avoid flattening
     * data on subsequent updates, or to restart a query after a loading failure.
     */
    or: <T>(lhs: RemoteData<T>, rhs: RemoteData<T>): RemoteData<T> =>
        RemoteData.isReady(lhs) ? lhs : rhs,

    /**
     * Apply a transform function to a remote data if it is ready, otherwise
     * return the current state.
     */
    map: <T, U>(
        remoteData: RemoteData<T>,
        mapFn: (value: T) => U,
    ): RemoteData<U> =>
        RemoteData.isReady(remoteData) ? mapFn(remoteData) : remoteData,

    /**
     * Checks if all the input `RemoteData` are ready, and if so
     * returns an array of the values. Otherwise, it returns a single
     * status, in the following priority order:
     *
     * 1. Failure
     * 2. `RemoteData.LOADING`
     * 3. `RemoteData.NOT_ASKED`
     */
    all,
};

/**
 * Map `T` such that each field can be loaded remotely. Note that due to the
 * way `RemoteData` is defined, this transformation is idempotent:
 *
 *  ```typescript
 *  RemoteData<T> === RemoteData<RemoteData<T>>
 *  ```
 *
 * This may be surprising when compared to monadic types in other languages.
 */
export type RemotePerField<T> = { [k in keyof T]: RemoteData<T[k]> };

// Overload declarations for `RemoteData.all`. This behaves like `Promise.all`
// for remote data.

/**
 * Checks if all the input `RemoteData` are ready, and if so
 * returns an array of the values. Otherwise, it returns a single
 * status, in the following priority order:
 *
 * 1. Failure
 * 2. `RemoteData.LOADING`
 * 3. `RemoteData.NOT_ASKED`
 */
function all<T1, T2, T3, T4, T5>(
    t1: RemoteData<T1>,
    t2: RemoteData<T2>,
    t3: RemoteData<T3>,
    t4: RemoteData<T4>,
    t5: RemoteData<T5>,
): RemoteData<[T1, T2, T3, T4, T5]>;

/**
 * Checks if all the input `RemoteData` are ready, and if so
 * returns an array of the values. Otherwise, it returns a single
 * status, in the following priority order:
 *
 * 1. Failure
 * 2. `RemoteData.LOADING`
 * 3. `RemoteData.NOT_ASKED`
 */
function all<T1, T2, T3, T4>(
    t1: RemoteData<T1>,
    t2: RemoteData<T2>,
    t3: RemoteData<T3>,
    t4: RemoteData<T4>,
): RemoteData<[T1, T2, T3, T4]>;

/**
 * Checks if all the input `RemoteData` are ready, and if so
 * returns an array of the values. Otherwise, it returns a single
 * status, in the following priority order:
 *
 * 1. Failure
 * 2. `RemoteData.LOADING`
 * 3. `RemoteData.NOT_ASKED`
 */
function all<T1, T2, T3>(
    t1: RemoteData<T1>,
    t2: RemoteData<T2>,
    t3: RemoteData<T3>,
): RemoteData<[T1, T2, T3]>;

/**
 * Checks if all the input `RemoteData` are ready, and if so
 * returns an array of the values. Otherwise, it returns a single
 * status, in the following priority order:
 *
 * 1. Failure
 * 2. `RemoteData.LOADING`
 * 3. `RemoteData.NOT_ASKED`
 */
function all<T1, T2>(
    t1: RemoteData<T1>,
    t2: RemoteData<T2>,
): RemoteData<[T1, T2]>;

/**
 * Checks if all the input `RemoteData` are ready, and if so
 * returns an array of the values. Otherwise, it returns a single
 * status, in the following priority order:
 *
 * 1. Failure
 * 2. `RemoteData.LOADING`
 * 3. `RemoteData.NOT_ASKED`
 *
 * @param args An array or tuple of `RemoteData` values.
 */
function all<T>(...args: RemoteData<T>[]): RemoteData<T[]>;

/**
 * Checks if all the input `RemoteData` are ready, and if so
 * returns an array of the values. Otherwise, it returns a single
 * status, in the following priority order:
 *
 * 1. Failure
 * 2. `RemoteData.LOADING`
 * 3. `RemoteData.NOT_ASKED`
 *
 * @param args An array or tuple of `RemoteData` values.
 */
// XXX This is not an arrow function because of the overloads.
function all<T>(...args: RemoteData<T>[]): RemoteData<T[]> {
    // If everything is ready, then return the array
    if (args.every(RemoteData.isReady)) return args as T[];

    // If _any_ of the args are in the `failure` state, the whole thing
    // is a failure.
    const firstFailure = args.find(RemoteData.isFailure);
    if (firstFailure) return firstFailure;

    // If _any_ of the args are in the `LOADING` state and _none_ of the
    // args are failures, then the whole thing is `LOADING`.
    if (args.includes(RemoteData.LOADING)) return RemoteData.LOADING;

    // We have at least one non-ready item, and no items in failure or loading
    // states. Therefore, we must not have asked for any of the items yet.
    return RemoteData.NOT_ASKED;
}

export default RemoteData;
