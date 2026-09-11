```
# Feniks Real Estate | WebMCP Production Integration &amp; Evals Discrepancy Case Study

This repository demonstrates a real-world, production implementation of the **WebMCP (Web Model Context Protocol)** API on a real estate platform ([feniks.rs](https://www.feniks.rs/)).

The project connects Google Tag Manager (GTM), an air-gapped PHP/MySQL REST backend, and browser-native AI agent capabilities with **zero frontend code modifications**.

---

## 🌐 Google Chrome Origin Trial Participant

This project actively participates in the official **Google Chrome WebMCP Origin Trial**.

Tools registered on `feniks.rs` are exposed to compatible browser agents (Chrome 149+ / Edge 147+) via Origin Trial tokens or by enabling `chrome://flags/#enable-webmcp-testing`.

---

## 🛠 Project Architecture

The implementation uses Google Tag Manager (GTM) to declaratively expose imperative tools to the browser's model context while relying on a secure, hardened PHP REST relay on the server side.

### 1. Zero-Frontend Deployment via GTM
Tools are registered dynamically via Google Tag Manager using modern WebMCP standards:
* **API Standards Compatibility:** Adheres to Chrome 150+ / 152+ standards using `document.modelContext` with fallbacks (`document.modelContext || window.navigator.modelContext`).
* **Execution Cancellation (Chrome 153+):** Leverages `context.signal` (`AbortSignal`) passed to `execute(input, context)`, ensuring in-flight `fetch()` requests are aborted if the agent or user cancels the query.
* **Registered Tools:**
  1. `feniks_pretraga`: Handles property filtering (Transaction, Type, Location, Structure, Budget).
  2. `feniks_detalji`: Fetches full technical specifications and descriptions via internal ID or public listing code.
  3. `feniks_info_usluge`: Provides official agency contact details, office location, and service links.

### 2. Hardened PHP REST Relay
* **Read-Only Protocol:** All endpoints enforce `annotations: { readOnlyHint: true }` to signal non-mutating execution.
* **Canonical SEO URL Injection:** Automatically formats and returns exact property URLs (`https://www.feniks.rs/nekretnina/{id}`) directly in search and detail payloads.
* **Context Budgeting:** Property descriptions are automatically truncated to 1,000 characters to comply with the recommended ~1.5K character output budget and prevent LLM context overflows.
* **SQL Injection Safeguards:** All database queries strictly enforce MySQL Prepared Statements (`bind_param`).

---

## 📊 Evals Discrepancy: Tool Inspector vs. Live LLM Agent

Through extensive production testing, we identified a key distinction between synthetic and probabilistic evaluations:

1. **Model Context Tool Inspector (Synthetic Eval):**
   * Validates tool registration syntax and JSON Schema compliance.
   * Returns a `200 OK PASS` even if payloads return raw database IDs without canonical routing context.
2. **Live LLM Agent (Probabilistic Eval):**
   * Fails or stumbles during natural language user journeys when tools return raw primary keys (`id: 47`), as the agent cannot infer site-specific SEO URL routes (`/nekretnina/47`).
   * **Production Fix:** Injecting explicit canonical URLs (`"url": "https://www.feniks.rs/nekretnina/47"`) directly into the REST payload resolved agent hallucinations and enabled instant, single-turn URL rendering for end users.

---

## 📁 Repository Structure

```text
├── /server
│   ├── pretraga-api.php   # Secure PHP REST endpoint for property search &amp; SEO URLs
│   └── detalji-api.php    # Secure PHP REST endpoint for property details &amp; context budgeting
├── /gtm
│   └── webmcp-gtm-tag.js  # Production GTM JavaScript snippet (3 registered tools)
└── README.md              # Project documentation &amp; Case Study

```

---




