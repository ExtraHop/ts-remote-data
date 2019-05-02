# ts-remote-data

`ts-remote-data` provides a data type and helper functions for representing asynchronously-available data in a React component, Redux store, or anywhere that you need to have a view of a Promise or other async operation at a moment in time.
Declaring properties as `RemoteData<T>` allows you to avoid passing around separate `isFooLoading` and `fooError` properties, and requires you to put guards in before reading that value so you don't have to remember to add it.

This package is inspired by Elm's [`RemoteData`](https://github.com/krisajenkins/remotedata), which solves the same problem.

## Example

```typescript
interface State {
    me: RemoteData<UserProfile>;
    messages: RemoteData<Message[]>;
}

const INITIAL_STATE: State = {
    me: RemoteData.NOT_ASKED,
    messages: RemoteData.NOT_ASKED,
};
```

When the user provides login credentials, your reducer would set `me` to `RemoteData.LOADING`.
On success, `me` would be set to the profile object returned by the server.
On a failed login, `me` would be set to the error returned by the server so your app could surface the appropriate error to the user.

After login, your app would kick off a message fetch. At that point, `messages` would be set to `RemoteData.or(state.messages, RemoteData.LOADING)`, so that if messages were already visible they wouldn't be hidden by the loading spinner.
If the message fetch succeeds, `messages` would be set to the new value.
If the message fetch fails, `messages` would be set to `RemoteData.or(state.messages, RemoteData.fail())`, and dispatch an effect, thunk, or saga to show a generic notification.

## Incremental Adoption

`RemoteData<T>` is designed to be introduced gradually into an existing codebase.
Functions that accept `T` can be changed to accept `RemoteData<T>` without modifying arguments at call sites.
Changing a function to return `RemoteData<T>` will immediately cause compile errors that you can use to find where changes are needed.
The error variant of `RemoteData<T>` is always `unknown`, which makes conversion from a rejected promise very easy.

## Efficiency

`RemoteData` is built to be lean.
It doesn't perform any allocations for the not-asked, loading, or ready/success states.