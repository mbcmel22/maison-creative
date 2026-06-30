/* =====================================================================
   Maison Créative - initialisation du client Supabase
   Renvoie un client pret a l'emploi, ou null si la config n'est pas
   encore renseignee (le site reste alors en mode statique).
   ===================================================================== */

var MC_DB = null;

function mcGetClient() {
  if (MC_DB) return MC_DB;
  var c = window.MC_CONFIG;
  var ready = c && c.SUPABASE_URL && c.SUPABASE_ANON_KEY
    && c.SUPABASE_URL.indexOf('TON-PROJET') === -1
    && c.SUPABASE_ANON_KEY.indexOf('TA_CLE') === -1
    && window.supabase && typeof window.supabase.createClient === 'function';
  if (!ready) return null;
  MC_DB = window.supabase.createClient(c.SUPABASE_URL, c.SUPABASE_ANON_KEY);
  return MC_DB;
}
