<script>
(function() {
  // Provera modelContext-a prema zvaničnom WebMCP standardu [5, 6]
  var modelContext = document.modelContext || window.navigator.modelContext;

  if (modelContext) {

    // 1. ALAT ZA PRETRAGU NEKRETNINA
    modelContext.registerTool({
      name: "feniks_pretraga",
      description: "Pretrazuje bazu nekretnina na feniks.rs po tipu, akciji, lokaciji, strukturi i budzetu.",
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
          // Prosleđivanje context.signal (AbortSignal) u fetch poziv [7, 8]
          var signal = context && context.signal;
          var url = '/pretraga-api.php?akcija=' + encodeURIComponent(input.akcija) + '&tip=' + encodeURIComponent(input.tip);
          
          if (input.lokacija) { url += '&lokacija=' + encodeURIComponent(input.lokacija); }
          if (input.struktura) { url += '&struktura=' + encodeURIComponent(input.struktura); }
          if (input.budzet_do) { url += '&budzet_do=' + encodeURIComponent(input.budzet_do); }

          fetch(url, { signal: signal })
            .then(function(response) {
              if (!response.ok) { throw new Error("Mreza nije dostupna"); }
              return response.json();
            })
            .then(function(podaci) {
              if (podaci.status === "prazno" || podaci.status === "error") {
                resolve(podaci.message);
              } else {
                resolve(JSON.stringify(podaci));
              }
            })
            .catch(function(error) {
              if (error.name === 'AbortError') {
                resolve("Pretraga je otkazana.");
              } else {
                resolve("Trenutno ne mogu da pretrazim bazu. Pokusajte ponovo kasnije.");
              }
            });
        });
      }
    });

    // 2. ALAT ZA DETALJE NEKRETNINE (Podržava interni ID i šifru oglasa)
    modelContext.registerTool({
      name: "feniks_detalji",
      description: "Pribavlja sve tehnicke detalje i opis nekretnine preko internog ID-a ili javne sifre oglasa sa sajta.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        properties: { 
          id: { 
            type: "string", 
            description: "Jedinstveni ID broj ili javna sifra nekretnine sa sajta (npr. '47' ili '10536-01')." 
          } 
        },
        required: ["id"]
      },
      execute: function(input, context) {
        return new Promise(function(resolve) {
          var signal = context && context.signal;
          var url = '/detalji-api.php?id=' + encodeURIComponent(input.id);

          fetch(url, { signal: signal })
            .then(function(response) {
              if (!response.ok) { throw new Error("Mrezna greska"); }
              return response.json();
            })
            .then(function(podaci) {
              if (podaci.status === "error") {
                resolve(podaci.message);
              } else {
                resolve(JSON.stringify(podaci));
              }
            })
            .catch(function(error) {
              if (error.name === 'AbortError') {
                resolve("Ucitavanje detalja je otkazano.");
              } else {
                resolve("Greska pri ucitavanju detalja sa servera.");
              }
            });
        });
      }
    });

    // 3. ALAT ZA KONTAKT, USLUGE I PONUDU NEKRETNINA
    modelContext.registerTool({
      name: "feniks_info_usluge",
      description: "Pruza zvanicne kontakt podatke agencije Feniks Real Estate (telefoni, adresa kancelarije, email), linkove ka stranicama 'O nama' i 'Ponudite nekretninu', kao i informacije o uslugama.",
      annotations: { readOnlyHint: true },
      inputSchema: {
        type: "object",
        properties: {
          upit_tip: {
            type: "string",
            enum: ["kontakt", "ponuda_stanova", "usluge_i_provizija", "opste_informacije"],
            description: "Tip informacije koju korisnik zeli."
          }
        }
      },
      execute: function() {
        return Promise.resolve(JSON.stringify({
          agencija: "Feniks Real Estate",
          adresa_kancelarije: "Beogradska 8, II sprat, 11000 Beograd, Srbija",
          telefoni: {
            fiksni_1: "+381 11 3618 371",
            fiksni_2: "+381 11 3618 372",
            mobilni: "+381 62 348 610"
          },
          email: "fenixsistem@gmail.com",
          linkovi: {
            ponudite_nekretninu: "https://feniks.rs/ponudite-nekretninu",
            o_nama: "https://feniks.rs/o-nama"
          },
          ponuda_nekretnina_vlasnici: "Vlasnici koji zele da prodaju ili izdaju stan mogu kontaktirati agenciju na telefone (+381 62 348 610, +381 11 3618 371), email fenixsistem@gmail.com ili popuniti formu na stranici https://feniks.rs/ponudite-nekretninu.",
          usluge: "Posredovanje u prometu nekretnina, pravna provera dokumentacije, procena vrednosti i oglasavanje. Vise informacija na https://feniks.rs/o-nama."
        }));
      }
    });

    console.log("✅ WebMCP: Svi Feniks alati (pretraga, detalji, info/usluge) su uspesno registrovani.");
  }
})();
</script>


