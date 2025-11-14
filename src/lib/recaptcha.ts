// reCAPTCHA v3 helper
declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

// reCAPTCHA v3 site key
export const RECAPTCHA_SITE_KEY = '6Lc-SwwsAAAAAHqlfKF5tEIui5TwYwkTQX6-6Skn';

export const executeRecaptcha = async (action: string): Promise<string> => {
  try {
    if (!window.grecaptcha) {
      throw new Error('reCAPTCHA not loaded');
    }
    const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
    return token;
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error);
    throw error;
  }
};
