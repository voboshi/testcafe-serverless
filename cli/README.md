# serverless-browser-tests-cli

Deploy lambdas and resources:
```sh
npx testcafe-serverless-cli init --accessKeyId=XXXXXXXXXXXX --secretAccessKey=XXXXXXXXXXXX
```

Run testcafe tests:
```sh
npx testcafe-serverless-cli run --accessKeyId=XXXXXXXXXXXX --secretAccessKey=XXXXXXXXXXXX --testcafeDir=/path/to/test-cafe-project --concurrency=1
```

You can pass the following options to the `npx testcafe-serverless-cli run [options]` function.

Parameter         | Type    | Description                                                                                                                                                                           | Default
----------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------
`skipJsErrors`    | Boolean | Defines whether to continue running a test after a JavaScript error occurs on a page (`true`), or consider such a test failed (`false`).                                              | `false`
`skipUncaughtErrors` | Boolean | Defines whether to continue running a test after an uncaught error or unhandled promise rejection occurs on the server (`true`), or consider such a test failed (`false`).                                              | `false`
`selectorTimeout` | Number  | Specifies the time (in milliseconds) within which [selectors](https://github.com/DevExpress/testcafe/blob/master/docs/articles/documentation/test-api/selecting-page-elements/selectors/README.md) make attempts to obtain a node to be returned. See [Selector Timeout](https://github.com/DevExpress/testcafe/blob/master/docs/articles/documentation/test-api/selecting-page-elements/selectors/using-selectors.md#selector-timeout). | `10000`
`assertionTimeout` | Number  | Specifies the time (in milliseconds) within which TestCafe makes attempts  to successfully execute an [assertion](https://github.com/DevExpress/testcafe/blob/master/docs/articles/documentation/test-api/assertions/README.md) if [a selector property](https://github.com/DevExpress/testcafe/blob/master/docs/articles/documentation/test-api/selecting-page-elements/selectors/using-selectors.md#define-assertion-actual-value) or a [client function](https://github.com/DevExpress/testcafe/blob/master/docs/articles/documentation/test-api/obtaining-data-from-the-client/README.md) was passed as an actual value. See [Smart Assertion Query Mechanism](https://github.com/DevExpress/testcafe/blob/master/docs/articles/documentation/test-api/assertions/README.md#smart-assertion-query-mechanism). | `3000`
`pageLoadTimeout` | Number  |  Specifies the time (in milliseconds) TestCafe waits for the `window.load` event to fire after the `DOMContentLoaded` event. After the timeout passes or the `window.load` event is raised (whichever happens first), TestCafe starts the test. You can set this timeout to `0` to skip waiting for `window.load`. | `3000`
`speed`           | Number  | Specifies the test execution speed. A number between `1` (fastest) and `0.01` (slowest). If an [individual action's](https://github.com/DevExpress/testcafe/blob/master/docs/articles/documentation/test-api/actions/action-options.md#basic-action-options) speed is also specified, the action speed setting overrides the test speed. | `1`
`stopOnFirstFail`    | Boolean | Defines whether to stop a test run if a test fails. You do not need to wait for all the tests to finish to focus on the first error. | `false`
