# Form data & image uploads
Edit text/select images → validate/compress locally → preview →
Save/Submit → authorize and validate server-side → upload media →
save text + media references together atomically in database → success.

Never upload before submission. Preserve image quality. Show real progress
when measurable; otherwise use an indeterminate indicator. Keep secrets
server-side. Make submissions and retries idempotent to prevent duplicates.

Use a shared, repeat-safe cleanup function for every failure or cancellation:
stop pending work, reset loading, release unused temporary resources,
and remove only newly uploaded assets confirmed unreferenced.
Preserve form input and previously saved data/images for retry.

Verify uncertain save outcomes before deleting assets. Persist upload
tracking so interrupted operations and failed cleanup can be retried.
For edits, delete replaced images only after the database update succeeds
and those images are no longer referenced.

Show success only after both uploads and the database save succeed.