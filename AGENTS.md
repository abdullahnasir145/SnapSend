This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo, EAS, or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building with EAS

Use EAS to build, sign, and submit the app in the cloud (`eas build`, `eas submit`) and to ship over-the-air updates (`eas update`) — no local Xcode or Android Studio required. Run EAS CLI as `bunx eas-cli <command>` in Bun projects, or `npx eas-cli@latest <command>` otherwise; substitute that for bare `eas` in docs examples.
Docs: https://docs.expo.dev/eas/index.md

## Rules

- If `ios/` and `android/` directories do not exist, they are generated (Continuous Native Generation). Never create or edit them by hand — configure native behavior in `app.json` and config plugins.
- Expo Go only includes its bundled native modules. After adding a library with native code, the app needs a development build: `npx expo run:ios|android` locally, or `eas build --profile development`.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md

## Project Structure

- Keep `src/app/` limited to Expo Router routes and layouts. Do not place feature implementation, shared components, hooks, services, or domain types in route files.
- Organize each product domain as a self-contained feature in `src/features/<feature-name>/`. Keep feature-specific components, hooks, services, types, and tests together.
- Put code in `src/components/`, `src/hooks/`, `src/lib/`, and `src/types/` only when it is genuinely reusable across features.
- Use clear, intention-revealing names. Avoid catch-all files, oversized components, duplicate logic, and direct coupling between feature folders.
- Maintain clear UI, state, and data-access boundaries so features can change and scale independently.

## Mobile-first Container Architecture

- Until the user explicitly starts a later tab or broader UI phase, prioritize iOS and Android phone layouts while avoiding web-breaking changes.
- Every screen must compose the shared `ScreenContainer` instead of recreating safe-area and base-screen layout behavior.
- `ScreenContainer` is layout-only: it owns screen background and safe-area layout, receives content through `children`, and does not own data, navigation, screen state, business logic, hooks, or helper functions.
- Presentational components own rendering and typed props only. Feature containers coordinate feature behavior, while hooks, helpers, types, services, and state belong in dedicated feature or shared folders.
- Route files compose containers and feature UI; do not use them as implementation hubs.
- This container structure is mandatory for **every route/page**, including tabs and all future screens. Give each page a dedicated feature container at `src/features/<feature>/<feature>Container/index.tsx` (for example, `src/features/home/homeContainer/index.tsx`). Routes should render only that container and remain thin; place screen UI and feature orchestration in the container, with reusable presentational pieces in the feature's `components/` folder.

## Components and TypeScript

- Reusable React components must export a named, typed `Props` interface.
- Document reusable components with concise JSDoc explaining their purpose and default behavior. Add comments for non-obvious decisions, but do not add comments that merely repeat the code.
- Component props must be explicitly declared and destructured in the function parameter list, matching `ScreenContainer`'s signature style. Do not accept a catch-all `props` object or rest props (`...props`), and do not assign defaults in the parameter list; add each supported prop to the named `Props` interface, destructure it explicitly, then resolve defaults in clearly named local variables.
- Use React Native Reusables as the shared component system. Add its UniWind-compatible components with `npx @react-native-reusables/cli@latest add <component>` only when required, then customize the generated, project-owned source under `src/components/ui/`.
- Use the shared `Heading1`, `Heading2`, `Heading3`, and `Paragraph` components for screen typography instead of raw React Native `Text` in app screens. Their default size and weight establish the type scale; override them per screen through their typed `size`, `weight`, and `className` props.
- Use Poppins as the app font. Load its required weights through the shared root font map, and apply the matching Poppins family through the shared typography components rather than setting font families within screens.
- Prefer NativeWind utility classes (`className`) for styling. Use `StyleSheet` only when NativeWind cannot produce the required visual accuracy or behavior.
- Destructure typed props directly in the component parameter list (for example, `function Component({ value }: ComponentProps)`) rather than accepting `props` and destructuring inside the function body.
- Prefer small, composable components with explicit callbacks and accessible labels, roles, and hints where applicable.
- Do not use `any`. Type external data at its boundary and validate it before use.
- Avoid hidden side effects; make asynchronous behavior, state ownership, and error handling explicit.

## Security and Privacy

- Never commit credentials, API keys, tokens, or private user data. Use environment configuration and document required variables without exposing values.
- Do not log personally identifiable, financial, authentication, or other sensitive data.
- Validate, sanitize where appropriate, and safely handle all user-controlled and external data.
- Request the minimum device permissions needed for a feature and explain the user-facing purpose.
- Store sensitive values using secure platform storage; do not use insecure local storage for secrets or authentication tokens.
- Review the maintenance, security, and Expo SDK compatibility of every dependency before adding it.

## Quality, Collaboration, and Commits

- Use the two-environment Git flow: feature and fix branches merge into `dev` (development/staging), and only `dev` may merge into `main` (production). Never open a pull request directly from a feature or fix branch to `main`.
- Keep each change focused; do not include unrelated refactors or generated files.
- Apply the repository formatter when configured. Run formatting, linting, typechecking, relevant tests, and a targeted security review when applicable; report any unavailable or blocked check clearly.
- Before making a material assumption about product behavior, security, architecture, data handling, or other risky behavior, ask the user a concise, structured question.
- Do not create commits unless the user explicitly approves. After a completed change, propose one atomic Conventional Commit message in the form `type(scope): concise imperative summary`.
