# CrowdFlow Predictive Counterfactual Crowd Orchestration

CrowdFlow is a decision-support prototype for campus service-region occupancy. All bundled occupancy, forecasts, and scenario outputs are synthetic examples; this project does not connect to cameras, Wi-Fi, gate sensors, messaging, or campus controls.

## Architecture

- `src/`: React 18 and Vite application with dashboard, monitoring, predictions, analytics, alerts, counterfactual lab, and settings.
- `src/services/api.js`: the single frontend API client. With no `VITE_API_URL`, it uses clearly labelled bundled demo data and browser-local settings. With a URL configured, HTTP errors are shown instead of silently replaced by mock results.
- `backend/app/main.py`: FastAPI routes, validation, CORS, and small JSON-file persistence for settings, alert states, and simulated intervention decisions.
- `backend/app/engine.py`: deterministic scenario and forecast logic, separated from routes.

## Requirements and setup (Windows PowerShell)

Open two VS Code terminals in the `crowdflow` directory.

Terminal 1, backend:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r backend\requirements.txt
$env:CORS_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173"
$env:CROWDFLOW_STATE_FILE = "$PWD\backend\state.json"
py -m uvicorn app.main:app --app-dir backend --reload
```

Terminal 2, frontend:

```powershell
npm install
$env:VITE_API_URL = "http://127.0.0.1:8000"
npm run dev
```

Open the Vite URL (normally `http://localhost:5173`). For mock/demo mode, omit or clear `VITE_API_URL` and restart Vite:

```powershell
Remove-Item Env:VITE_API_URL -ErrorAction SilentlyContinue
npm run dev
```

There are no secrets or external service credentials. `CROWDFLOW_STATE_FILE` is optional; its default is `backend/app/state.json`. Persistence is a local JSON file, suitable only for this single-user prototype.

## API

- `GET /health`
- `GET /api/regions`
- `GET /api/counterfactual`
- `POST /api/scenarios/compare` JSON: `{"regionId":"canteen-a","destinationId":"canteen-b","ratio":0.25,"counters":1,"staff":1,"horizon":15}`
- `GET /api/alerts`; `POST /api/alerts/{id}/acknowledge` or `/dismiss`
- `GET /api/feedback`; `GET /api/analytics`
- `GET /api/settings`; `PUT /api/settings`
- `POST /api/interventions` JSON: `{"region":"canteen-a","scenario":"B","decision":"approve"}`

Intervention decisions record only simulated previews. No real action is dispatched.

## Checks

```powershell
npm run build
py -m unittest discover -s backend\tests -v
```

Run the API after installing its requirements. The unit tests for the pure scenario engine need only Python's standard library.

## Prototype assumptions and limitations

The report bundled among the available files is a matrix-chain multiplication report, not a CrowdFlow report; the other DSA report is an unfilled template. Therefore, the requested CrowdFlow report's region names and methodology could not be verified. Five existing names were retained and `Main Gate` and `Student Hub` were added as explicitly illustrative prototype defaults. Replace them with the report's names when that report is available.

The model extends synthetic constant arrival and departure rates over 5, 10, and 15 minutes. Occupancy is bounded at configured capacity; overflow and metered arrivals remain visible in external queue accounting. Redirection is limited to configured neighboring regions and uses an illustrative five-minute transit assumption. Additional counters and staff affect service throughput only; they do not increase physical capacity. Settings persist locally in mock mode or in a backend JSON file. There are no actual observations, so forecast residuals, MAE, and RMSE are not computed. No ML model is trained, and scenarios are not measured performance results.
