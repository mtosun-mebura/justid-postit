/**
 * Centrale API-basis-URL: in productie vervangen door het echte backend-domein.
 * Relatieve paden werken niet voor een andere poort (4200 vs 8080), vandaar absolute URL.
 */
export const environment = {
  apiBaseUrl: 'http://localhost:8080',
};
