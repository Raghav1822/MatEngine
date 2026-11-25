# MatEngine

An interactive engineering problem-solving workspace that helps turn questions into explainable models, MATLAB-ready scripts, and visual results.

## What is here

- A responsive solver studio with examples for damped vibration, cantilever deflection, lumped cooling, integration, eigenvalues, and optimization.
- MATLAB scripts generated from the selected validated template, with copy and download actions.
- Browser-based illustrative previews and CSV export. These are explicitly labeled previews, not MATLAB execution.
- A Node.js proxy and reviewed MATLAB function for calling MATLAB Production Server. The proxy allowlists solver operations; it never executes visitor-submitted MATLAB source.
- A GitHub Actions workflow for deploying the static site to GitHub Pages.

## Run the frontend locally

Open `index.html` in a browser, or serve this directory with any static web server. The examples work without a backend.

## Run the MATLAB proxy

The proxy uses only Node.js built-ins (Node 18+). Deploy `matlab/matengineSolve.m` to MATLAB Production Server first, then start the proxy with its function endpoint:

```sh
MPS_FUNCTION_URL=https://your-mps-host:9910/matengine/matengineSolve \\
MPS_AUTH_TOKEN=your-server-side-token \\
ALLOWED_ORIGIN=https://your-site.example \\
node server/server.js
```

`MPS_AUTH_TOKEN` is optional if your server uses another trusted authentication mechanism. Never commit credentials or expose them in `config.js`. The browser only connects to the proxy. The proxy validates the operation, limits request size and execution time, and validates returned numeric data.

Set `window.MATENGINE_API_BASE` in `config.js` to the proxy's HTTPS base URL (for example `https://api.example.com`). For local development, set it to `http://localhost:3000`. Deploy the proxy in a network environment that can reach the MPS endpoint and configure its firewall, TLS, authentication, rate limiting, and CORS policy for your deployment.

## GitHub Pages

The `Deploy MatEngine to GitHub Pages` workflow deploys the repository root on pushes to `main`. Enable GitHub Pages in repository Settings → Pages and select **GitHub Actions** as the build and deployment source if it is not already enabled. The site URL is normally `https://Raghav1822.github.io/MatEngine/`. GitHub Pages availability for a private repository depends on the account plan and repository settings. If the workflow cannot create the Pages site, enable Pages from repository settings and rerun the workflow.

Until the proxy and licensed runtime are configured, MatEngine remains useful in **illustrative preview** mode; the interface does not claim that those preview calculations ran in MATLAB. Validate engineering results independently before real-world use.
