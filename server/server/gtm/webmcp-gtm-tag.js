/**
 * WebMCP Tool Registration for Feniks Real Estate
 * This script is intended to be used within a Google Tag Manager Custom HTML Tag.
 * It registers search and detail retrieval tools for AI agents.
 */

(function() {
  // Access the WebMCP context (standardized for Chrome 150+)
  var modelContext = document.modelContext || window.navigator.modelContext;

  if (modelContext) {
    // 1. TOOL: feniks_pretraga
    modelContext.registerTool({
      name: "feniks_pretraga",
      description: "Pretrazuje bazu nekretnina na feniks.rs (Prodaja/Izdavanje).",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        properties: {
          akcija: { type: "string", enum: ["Prodaja", "Izdavanje"] },
          tip: { type: "string", enum: ["Stan", "Kuca", "Poslovni prostor", "Plac", "Garaza"] },
          lokacija: { 
            type: "string", 
            enum: ["Savski Venac", "Sopot", "Stari Grad", "Surcin", "Vozdovac", "Vracar", "Zemun", "Zvezdara", "Cukarica", "Bar", "Beocin", "Danilovgrad", "Herceg Novi", "Indjija", "Petrovaradin (Novi Sad)", "Raska"] 
          },
          struktura: { 
            type: "string", 
            enum: ["Garsonjera", "1.0 - Jednosoban", "1.5 - Jednoiposoban", "2.0 - Dvosoban", "2.5 - Dvoiposoban", "3.0 - Trosoban", "3.5 - Troiposoban", "4.0 - Cetvorosoban", "4.5+ - Cetvorosoban i veci"] 
          },
          budzet_do: { type: "number" }
        },
        required: ["akcija", "tip"]
      },
      execute: function(input, context) {
        return new Promise(function(resolve) {
          // Chrome 153+ AbortSignal handling
          var signal = context && context.signal;
          var url = '/pretraga-api.php?akcija=' + encodeURIComponent(input.akcija) + '&tip=' + encodeURIComponent(input.tip);
          
          if (input.lokacija) { url += '&lokacija=' + encodeURIComponent(input.lokacija); }
          if (input.budzet_do) { url += '&budzet_do=' + encodeURIComponent(input.budzet_do); }

          fetch(url, { signal: signal })
            .then(function(response) {
              if (!response.ok) { throw new Error("Network error"); }
              return response.json();
            })
            .then(function(data) {
              if (data.status === "prazno") {
                resolve(data.message);
              } else {
                resolve(JSON.stringify(data));
              }
            })
            .catch(function(error) {
              if (error.name === 'AbortError') {
                resolve("Search cancelled by agent.");
              } else {
                resolve("Database currently unavailable. Please try again later.");
              }
            });
        });
      }
    });

    // 2. TOOL: feniks_detalji
    modelContext.registerTool({
      name: "feniks_detalji",
      description: "Pribavlja pune tehnicke detalje nekretnine preko ID-a.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        properties: { 
          id: { type: "string", description: "The unique ID of the property." } 
        },
        required: ["id"]
      },
      execute: function(input, context) {
        return new Promise(function(resolve) {
          var signal = context && context.signal;
          var url = '/detalji-api.php?id=' + encodeURIComponent(input.id);

          fetch(url, { signal: signal })
            .then(function(response) {
              if (!response.ok) { throw new Error("Network error"); }
              return response.json();
            })
            .then(function(data) {
              if (data.status === "error") {
                resolve(data.message);
              } else {
                resolve(JSON.stringify(data));
              }
            })
            .catch(function(error) {
              if (error.name === 'AbortError') {
                resolve("Details retrieval cancelled.");
              } else {
                resolve("Error fetching property details.");
              }
            });
        });
      }
    });

    console.log("WebMCP: Feniks tools successfully registered via GTM.");
  }
})();
