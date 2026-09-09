# Feniks Real Estate | WebMCP & AI Agent Integration

This repository demonstrates a real-world, production implementation of the **WebMCP (Web Model Context Protocol)** API on a real estate platform ([feniks.rs](https://www.feniks.rs)). 

The project connects Google Tag Manager (GTM), an air-gapped PHP/MySQL backend, and browser-native AI agent capabilities into a unified, secure system.

---

## 🌐 Google Chrome Origin Trial Participant

This project participates in the official **Google Chrome WebMCP Origin Trial**. 

> **Disclaimer & Experimental Status:**  
> WebMCP is an emerging W3C Community Group proposal currently undergoing testing. The tools registered on `feniks.rs` are available to compatible browser agents (Chrome 150+ / 153+) via Origin Trial tokens or by enabling `chrome://flags/#enable-webmcp-testing`.  
> For browsers without native WebMCP support, the site degrades gracefully with **zero impact** on human user experience (*Progressive Enhancement*).

---

## 🛠 Project Architecture

The implementation uses Google Tag Manager (GTM) to declaratively expose tools to the browser's model context while relying on a secure, hardened PHP REST relay on the server side.

### 1. Client-Side Registration (GTM & API Standards Compatibility)
Tools are registered dynamically via Google Tag Manager using modern WebMCP standards:
* **API Compatibility:** Adheres to the latest standards using `document.modelContext` with fallbacks (`document.modelContext || window.navigator.modelContext`).
* **Execution Cancellation (Chrome 153+):** Leverages `context.signal` (`AbortSignal`) to abort in-flight requests if the agent cancels the action.
* **Registered Tools:**
  * `feniks_pretraga`: Handles complex property filtering.
  * `feniks_detalji`: Fetches full technical specifications via unique ID.

### 2. Secure Backend Relay (PHP / MySQL)
* **Read-Only Protocol:** The agent has read-only access to prevent database mutations.
* **Context Budgeting:** Property descriptions are automatically truncated to 1,000 characters to respect LLM context window limits.
* **Security:** All database queries strictly enforce Prepared Statements (`bind_param`).

---

## 🤖 AI Interaction & Tool Chaining

The agent natively interprets Serbian language queries and chains tool calls automatically.

**Example Multi-Turn Journey:**
* **User:** *"Pronađi mi stan za prodaju u Zemunu do 200.000 evra i prikaži detalje za najjeftiniji."*
* **Agent Execution:**
  1. Invokes `feniks_pretraga` with JSON parameters.
  2. Identifies the lowest-priced property ID from the results.
  3. Automatically invokes `feniks_detalji` to retrieve full data.

---

## 🔍 Verification & Visual Proof

### 🌐 Official Origin Trial Registration
![Origin Trial Registration](https://github.com/sistemfeniks06-droid/webmcp-realestate-live/blob/main/server/server/gtm/assets/origin-trial-registration.png.png?raw=true)

### 📺 Live Demo: WebMCP Inspector in Action
Check out how the agent discovers tools and retrieves live data from feniks.rs:

https://github.com/sistemfeniks06-droid/webmcp-realestate-live/blob/main/server/server/gtm/assets/inspector%20demo%20.webm?raw=true

---

## 📁 Repository Structure

```text
├── /server
│   ├── pretraga-api.php            # Secure PHP search endpoint
│   └── detalji-api.php             # Secure PHP details endpoint
├── /gtm
│   └── webmcp-gtm-tag.js           # GTM Tool Registration script
├── /server/server/gtm/assets/      # Proof of registration and demo video
└── README.md





