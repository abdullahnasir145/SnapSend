# Scan screen implementation

## Completed

- Expo Go-compatible camera preview, permission request, flash control, camera switch, receipt capture, and gallery import.
- Receipt review with retake flow and an explicit OCR-placeholder state.
- Production permission copy configured through Expo config plugins. A development build is not required for the current Expo Go flow.

## Deferred OCR

OCR is intentionally not implemented. Receipt images remain in the app cache during the current session; no image, merchant, total, or line-item data is sent to a server.

## Production-ready plan

1. Select and assess an OCR provider, including retention, regional processing, cost, and data-processing terms.
2. Ask for explicit user confirmation before uploading a receipt to OCR.
3. Upload over HTTPS with authenticated, short-lived URLs; do not log receipt images or extracted financial data.
4. Validate OCR output, show an editable review form, and save only confirmed transactions.
5. Add retry, offline, timeout, cancellation, and permission-denied states.
6. Test on physical Android and iOS devices, including system navigation, denied permissions, low light, long receipts, and gallery import.
7. Build a development build only if future OCR requires a native SDK unavailable in Expo Go.
