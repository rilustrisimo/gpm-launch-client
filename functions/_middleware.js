export const onRequest = async (context) => {
  // This file exists to enable Cloudflare Pages Functions
  return context.next();
};
