export const WHATSAPP_NUMBER = "6287782408192";
export const WHATSAPP_MESSAGE = "Halo, saya tertarik untuk konsultasi pembuatan website. Bisa dibantu?";

export const getWhatsAppUrl = (message?: string) => {
  const text = encodeURIComponent(message || WHATSAPP_MESSAGE);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
};
