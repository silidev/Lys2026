<!-- INSTRUCTIONS.md -->
# Permanent Instructions for the AI Developer

This file contains ongoing instructions for developing the application.
Please adhere to these guidelines in all future changes.

1.  **Language:** Keep all text within the application UI and all comments
    within the code in English.
5.  **Testing:** Write unit tests for all new functionality to ensure
    reliability and prevent regressions.
6.  **Test Independence:** Tests must not call external APIs (e.g., Gemini).
    All external services should be mocked within the test files.
8.  **Modal State Management:** When a modal's edits need to be cancelable,
    it should manage its own internal state and commit changes only via an
    `onSave` prop. For modals where changes should be instant and cannot be
    canceled, use a "controlled component" pattern, passing state setters
    directly as props.
9.  **State Persistence:** Persist all relevant user-configurable state (e.g.,
    text, prompts, settings) to `localStorage` to survive page reloads. State
    related to temporary operations, like an in-progress review, should not be
    persisted.
10. **Data Backup:** Provide and maintain a feature for users to download a
    backup of all their data stored in `localStorage` and to restore it from a
    file.
11. **Backup Compatibility:** When changing the data structure of any item
    stored in `localStorage`, ensure that the application can still import
    backups created with older versions of the app. This includes handling
    missing fields in old backup data gracefully.
15. Keep source files small. Try to split anything above 5 KB.
16. Separate Test and non-test code into different files. They must never be in the same file.
17. You must only fix things in code whose behaviour is thoroughly covered by tests.
18. You MUST tell the user if there are any contradictions or problems with your orders.
19. **Mobile-First Design:** The application and its UI must be designed primarily for 
mobile phones. This means prioritizing a dense and touch-friendly interface.
20. In the first line of EVERY file assign its full path and filename to a string variable.
21. All test fails must ALWAYS report the test function name, filename and full path of
 the test that failed.
22. Where possible **wrap** all lines at column 60.
23. Make all **types** as specific as possible. Never use 'any'. Try to avoid 'unknown' 
and use more specific types.
24. NEVER retrieve static UI elements by their displayed text, but instead select them a id.
25. NEVER write tests that test the UI, except on explicit and unambiguous orders. Instead
write tests that check the logic behind the UI.
You must NEVER use assert(...) to assert to the equality of values. You must use assertEquals(...) instead.
26. If a user request seems mismatched with the app, do NOT change any file, but report the mismatch.
27. **No creativity** NEVER interpret any request which changes files creatively! Any changes in files 
must always be based in explicit, unambiguous user orders. If not, change NO file, but only report.
28. **Tooltips**: On longpress and mouseover all interactive UI elements must show a help text (using the 'title' attribute).
29. **DRY**: Check if there is an operation which is done frequently. If so, create an entity 
to do that. An example for this which has already been done in the code is the creation of an
 assertEquals function. 
30. Do NOT change the default data, except on directy and explicit orders.
31. Do NOT use window.confirm, because it is blocked, but instead use /components/ConfirmModal.tsx