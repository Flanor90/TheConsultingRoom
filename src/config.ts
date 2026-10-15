// Impostazioni del sito: modifica qui, non nelle pagine.
export const config = {
  name: 'The Consulting Room',
  tagline:
    'Clinical guides for therapists whose clients are already talking to AI, written by a psychoanalytic clinician.',
  description:
    'Clinical guides, compendia and session tools for psychotherapists, written by Alberto Del Bove, a psychoanalytically oriented psychotherapist. Sold on Etsy as instant PDF downloads.',
  author: 'Alberto Del Bove',
  etsyShop: 'https://www.etsy.com/shop/TheConsultingRoom',
  locale: 'en_US',

  // Indirizzo email per istituti e domande. Lascia '' finché non decidi quale usare.
  contactEmail: 'alberto.delbove.psicoterapeuta@gmail.com',

  // Prezzi base letti da Etsy (data in data/products.json). false = mostra solo i pulsanti.
  showPrices: true,

  // Newsletter: il componente esiste ma resta spento finché enabled è false.
  // Quando lo accendi, usa un servizio con doppio opt-in (es. Buttondown, MailerLite)
  // e incolla qui l'URL del form che ti dà il servizio.
  newsletter: {
    enabled: false,
    action: '',
    emailField: 'email',
    privacyNote:
      'You will get a confirmation email first; nothing is sent until you confirm. One email when a new guide or article is out, and you can unsubscribe from any email.',
  },

  // Statistiche senza cookie, spente. Esempi:
  // { provider: 'plausible', domain: 'tuodominio.com' }
  // { provider: 'goatcounter', code: 'tuocodice' }
  analytics: { provider: null as null | 'plausible' | 'goatcounter', domain: '', code: '' },
};
