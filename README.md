# MatEngine

An interactive engineering problem-solving workspace that helps turn questions into explainable models, MATLAB-ready scripts, and visual results.

## What is here

- A responsive solver studio with examples for damped vibration, cantilever deflection, lumped cooling, integration, eigenvalues, and optimization.
- MATLAB scripts generated from the selected validated template, with copy and download actions.
- Browser-based illustrative previews and CSV export. These are explicitly labeled previews, not MATLAB execution.
- A small integration seam for a trusted MATLAB Production Server proxy. The browser only calls a proxy; credentials must never be embedded in the static site.
- A GitHub Actions workflow for deploying the static site to GitHub Pages.

## Run locally

Open `index.html` in a browser, or serve this directory with any static web server. The examples work without a backend.

## GitHub Pages

The `Deploy MatEngine to GitHub Pages` workflow deploys the repository root on pushes to `main`. Enable GitHub Pages in repository Settings → Pages and select **GitHub Actions** as the build and deployment source if it is not already enabled. The site URL is normally `https://Raghav1822.github.io/MatEngine/`. GitHub Pages availability for a private repository depends on the account plan and repository settings.

## MATLAB Production Server integration

The deployed page is a static frontend. To execute calculations in MATLAB, deploy a trusted HTTPS proxy that exposes `POST /api/run` and configure `window.MATENGINE_API_BASE` in `config.js` to its base URL. The proxy should authenticate to MATLAB Production Server using server-side configuration, validate and allowlist supported solver operations, enforce input and time limits, and return JSON in this shape:

```json
{"x":[0,1,2],"y":[0,0.5,1],"summary":"Analysis completed by MATLAB."}
```

Configure the MATLAB Production Server endpoint and credentials on that proxy's host, not in this repository or the browser. Do not accept or execute arbitrary MATLAB source submitted by visitors. Only invoke reviewed MATLAB functions with validated structured inputs. Browser requests require HTTPS and appropriate CORS settings if the proxy uses a different origin.

Until that proxy is configured, MatEngine remains useful in **illustrative preview** mode; the interface does not claim that those preview calculations ran in MATLAB. Validate any engineering results independently before real-world use.
