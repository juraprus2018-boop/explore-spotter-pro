import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  nl: {
    translation: {
      hero: {
        title: "Ontdek de Wereld",
        subtitle: "Zoek naar duizenden bestemmingen wereldwijd met real-time kaarten en locatiegegevens",
        searchPlaceholder: "Zoek een stad, land of bestemming...",
        searchButton: "Zoeken",
      },
      card: {
        viewOnMap: "Bekijk op Kaart",
        city: "Stad",
        town: "Plaats",
        village: "Dorp",
        country: "Land",
        state: "Provincie",
        administrative: "Administratief",
      },
      map: {
        title: "Kaart Weergave",
      },
      results: {
        title: "Gevonden Locaties",
        searching: "Aan het zoeken...",
        noResults: "Begin met zoeken",
        noResultsDesc: "Gebruik de zoekbalk hierboven om bestemmingen te vinden. Zoek op steden, landen of specifieke locaties.",
      },
      toast: {
        resultsFound: "Zoekresultaten gevonden!",
        resultsFoundDesc: "{{count}} locatie gevonden voor \"{{query}}\"",
        resultsFoundDesc_other: "{{count}} locaties gevonden voor \"{{query}}\"",
        noResults: "Geen resultaten",
        noResultsDesc: "Probeer een andere zoekterm",
        searchError: "Fout bij zoeken",
        searchErrorDesc: "Er ging iets mis bij het zoeken. Probeer het later opnieuw.",
      },
    },
  },
  en: {
    translation: {
      hero: {
        title: "Discover the World",
        subtitle: "Search thousands of destinations worldwide with real-time maps and location data",
        searchPlaceholder: "Search for a city, country or destination...",
        searchButton: "Search",
      },
      card: {
        viewOnMap: "View on Map",
        city: "City",
        town: "Town",
        village: "Village",
        country: "Country",
        state: "State",
        administrative: "Administrative",
      },
      map: {
        title: "Map View",
      },
      results: {
        title: "Found Locations",
        searching: "Searching...",
        noResults: "Start searching",
        noResultsDesc: "Use the search bar above to find destinations. Search for cities, countries or specific locations.",
      },
      toast: {
        resultsFound: "Search results found!",
        resultsFoundDesc: "{{count}} location found for \"{{query}}\"",
        resultsFoundDesc_other: "{{count}} locations found for \"{{query}}\"",
        noResults: "No results",
        noResultsDesc: "Try a different search term",
        searchError: "Search error",
        searchErrorDesc: "Something went wrong while searching. Please try again later.",
      },
    },
  },
  de: {
    translation: {
      hero: {
        title: "Entdecke die Welt",
        subtitle: "Suchen Sie nach Tausenden von Reisezielen weltweit mit Echtzeit-Karten und Standortdaten",
        searchPlaceholder: "Suchen Sie nach einer Stadt, einem Land oder einem Reiseziel...",
        searchButton: "Suchen",
      },
      card: {
        viewOnMap: "Auf Karte anzeigen",
        city: "Stadt",
        town: "Ort",
        village: "Dorf",
        country: "Land",
        state: "Bundesland",
        administrative: "Verwaltung",
      },
      map: {
        title: "Kartenansicht",
      },
      results: {
        title: "Gefundene Standorte",
        searching: "Suche läuft...",
        noResults: "Mit der Suche beginnen",
        noResultsDesc: "Verwenden Sie die Suchleiste oben, um Reiseziele zu finden. Suchen Sie nach Städten, Ländern oder bestimmten Orten.",
      },
      toast: {
        resultsFound: "Suchergebnisse gefunden!",
        resultsFoundDesc: "{{count}} Standort gefunden für \"{{query}}\"",
        resultsFoundDesc_other: "{{count}} Standorte gefunden für \"{{query}}\"",
        noResults: "Keine Ergebnisse",
        noResultsDesc: "Versuchen Sie einen anderen Suchbegriff",
        searchError: "Suchfehler",
        searchErrorDesc: "Beim Suchen ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.",
      },
    },
  },
  fr: {
    translation: {
      hero: {
        title: "Découvrez le Monde",
        subtitle: "Recherchez des milliers de destinations dans le monde entier avec des cartes en temps réel et des données de localisation",
        searchPlaceholder: "Rechercher une ville, un pays ou une destination...",
        searchButton: "Rechercher",
      },
      card: {
        viewOnMap: "Voir sur la carte",
        city: "Ville",
        town: "Commune",
        village: "Village",
        country: "Pays",
        state: "État",
        administrative: "Administratif",
      },
      map: {
        title: "Vue de la carte",
      },
      results: {
        title: "Emplacements trouvés",
        searching: "Recherche en cours...",
        noResults: "Commencer la recherche",
        noResultsDesc: "Utilisez la barre de recherche ci-dessus pour trouver des destinations. Recherchez des villes, des pays ou des lieux spécifiques.",
      },
      toast: {
        resultsFound: "Résultats de recherche trouvés!",
        resultsFoundDesc: "{{count}} emplacement trouvé pour \"{{query}}\"",
        resultsFoundDesc_other: "{{count}} emplacements trouvés pour \"{{query}}\"",
        noResults: "Aucun résultat",
        noResultsDesc: "Essayez un autre terme de recherche",
        searchError: "Erreur de recherche",
        searchErrorDesc: "Une erreur s'est produite lors de la recherche. Veuillez réessayer plus tard.",
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "nl", // default language
    fallbackLng: "nl",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
