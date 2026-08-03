# Bidwise

Bidwise is a single-page MVP quote generator for commercial energy proposals. It turns a retail site brief into a presentation-ready report covering solar, battery storage, and EV charging.

## Run locally

Open `index.html` directly in a browser, or serve the folder with any static file server.

## MVP interactions

- View mode keeps the experience report-first and presentation-friendly.
- Edit mode exposes realistic project inputs and lets you toggle proposal scopes on or off.
- The left navigator jumps between the six report sections and tracks the section in view.
- Proposal economics update from the utility spend input; Share view-only link copies a presentation-safe URL.

## Firebase persistence and Google login

Firebase is the recommended free starting point for Bidwise because Google sign-in is supported directly by Firebase Authentication and Firestore has a no-cost daily quota on the Spark plan. Copy `firebase-config.example.js` to `firebase-config.js`, paste the Web app config from Firebase Console, enable Google under Authentication → Sign-in method, and create a Firestore database. The config file is ignored by git.

The connected Firebase project is `bidwise-6683d`, using Google sign-in and a production Firestore database in `nam5`. Firestore rules are mirrored in `firestore.rules`.

Without a Firebase config, the app still works locally and image replacements remain in the browser’s local storage.
