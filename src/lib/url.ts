// Prefissa i percorsi interni con la base del sito (es. /TheConsultingRoom su github.io).
// Con un dominio personalizzato la base è "/" e i percorsi restano uguali.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');
export const u = (path: string) => (path.startsWith('/') && !path.startsWith('//') ? `${base}${path}` : path);
