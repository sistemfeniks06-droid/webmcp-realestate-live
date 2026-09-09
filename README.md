# Feniks Real Estate | WebMCP & AI Agent Integration

This repository demonstrates a real-world, production implementation of the **WebMCP (Web Model Context Protocol)** API on a real estate platform ([feniks.rs](https://www.feniks.rs)). 

The project connects Google Tag Manager (GTM), an air-gapped PHP/MySQL backend, and browser-native AI agent capabilities into a unified, secure system.

---

## 🌐 Google Chrome Origin Trial Participant

This project participates in the official **Google Chrome WebMCP Origin Trial**. 

> **Disclaimer & Experimental Status:**  
> WebMCP is an emerging W3C Community Group proposal currently undergoing testing. The tools registered on `feniks.rs` are available to compatible browser agents (Chrome 149+ / Edge 147+) via Origin Trial tokens or by enabling `chrome://flags/#enable-webmcp-testing`.  
> For browsers without native WebMCP support, the site degrades gracefully with **zero impact** on human user experience (*Progressive Enhancement*).

---

## 🛠 Project Architecture

The implementation uses Google Tag Manager (GTM) to declaratively expose tools to the browser's model context while relying on a secure, hardened PHP REST relay on the server side.

### 1. Client-Side Registration (GTM & API Standards Compatibility)
Tools are registered dynamically via Google Tag Manager using modern WebMCP standards:
* **API Compatibility:** Adheres to the Chrome 150+ / 152+ standard using `document.modelContext` with fallbacks (`document.modelContext || window.navigator.modelContext`).
* **Execution Cancellation (Chrome 153+):** Leverages `context.signal` (`AbortSignal`) passed to the `execute(input, context)` function, ensuring in-flight `fetch()` requests are aborted if the agent or user cancels the action.
* **Registered Tools:**
  * `feniks_pretraga`: Handles complex property filtering (Transaction Type, Property Type, Location, Budget).
  * `feniks_detalji`: Fetches full technical specifications and descriptions using a unique property ID.

### 2. Secure Backend Relay (PHP / MySQL)
The backend acts as a hardened same-origin REST relay between the client-side WebMCP code and the database:
* **Read-Only Protocol:** The agent has read-only access to prevent unintended database mutations.
* **Context Budgeting:** In compliance with WebMCP security guidelines, property descriptions are automatically truncated (e.g., to 1,000 characters) to respect the recommended ~1.5K character output budget and prevent LLM context overflows.
* **SQL Injection Protection:** All database queries strictly enforce Prepared Statements (`bind_param`).
* **Security Annotations:** Tools include `readOnlyHint: true` to signal safe execution to the AI agent.

---

## 🤖 AI Interaction & Tool Chaining

The agent natively interprets Serbian language queries, maps informal inputs to structured `enum` parameters, and chains tool calls automatically.

**Example Multi-Turn Journey:**
* **User:** *"Pronađi mi stan za prodaju u Zemunu do 200.000 evra i prikaži detalje za najjeftiniji."*
* **Agent Execution:**
  1. Invokes `feniks_pretraga` with `{ akcija: "Prodaja", tip: "Stan", lokacija: "Zemun", budzet_do: 200000 }`.
  2. Parses the JSON output from the PHP API and identifies the lowest-priced property ID.
  3. Automatically invokes `feniks_detalji` with `{ id: "10664-1" }` to retrieve technical details.

---

## 🔍 Verification & Evals

System behavior, schema validation, and tool invocations were verified using:
* **Model Context Tool Inspector** (Official Chrome Extension).
* Deterministic testing of PHP REST endpoints.
* Failure mode testing (handling empty database responses and connection timeouts gracefully).

---

## 📁 Repository Structure

├── /server │   ├── pretraga-api.php    # Secure PHP endpoint for property search │   └── detalji-api.php     # Secure PHP endpoint for property details ├── /gtm │   └── webmcp-gtm-tag.html # Clean ASCII JavaScript snippet for GTM Custom HTML Tag └── README.md

---

## 🙏 Acknowledgements

Special thanks to the **Google Chrome WebMCP Team** for providing access to the Origin Trial program and enabling developers to shape the future of the agentic web.

**Live Website:** [feniks.rs](https://www.feniks.rs)  
**Developer:** NinoslavPetrusic
