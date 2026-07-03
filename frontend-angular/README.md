# MediTrack — Angular frontend

An **Angular 20 + Angular Material + Tailwind CSS** port of the React/Next.js
frontend in [`../frontend`](../frontend). Both frontends target the same
MediTrack API and are feature-equivalent; keep them in sync when the API changes.

## Stack mapping (React → Angular)

| React / Next.js                | Angular                                              |
| ------------------------------ | --------------------------------------------------- |
| Next.js App Router + guards    | Angular Router (lazy routes) + `CanActivate` guards |
| Zustand + `persist`            | `AuthService` (signals + `localStorage`)            |
| Axios + refresh interceptor    | `HttpClient` + functional `authInterceptor`         |
| TanStack **React** Query       | TanStack **Angular** Query (`injectQuery`/`injectMutation`) |
| MUI + Emotion theme            | Angular Material (M3) with teal/indigo token overrides |
| MUI X `BarChart`               | custom CSS `app-bar-chart`                           |
| `@microsoft/signalr`           | same, wrapped in `SignalrService`                   |
| Tailwind v4                    | Tailwind v3 (preflight disabled; Material owns reset) |

## Run

```bash
npm install
npm run dev      # ng serve on http://localhost:3000
```

The API base URL lives in `src/environments/environment.ts`
(`http://localhost:5293`, matching the React app's `.env.local`).

Start the backend first (see the repo root README):

```bash
docker compose up -d
dotnet run --project src/MediTrack.Api
dotnet run --project src/MediTrack.Workers
```

## Structure

```
src/app/
  core/        models, auth, api client, interceptor, guards, signalr, query services
  shared/      app-shell, page-header, loading, thread, badge, bar-chart, status/format helpers
  features/
    landing/   marketing landing page
    login/     sign-in + demo accounts
    staff/     dashboard, patients, appointments, records, prescriptions, refills, AI
    portal/    patient portal: home, appointments, prescriptions, records, messages
```

## Build

```bash
npm run build    # production build to dist/frontend-angular
```
