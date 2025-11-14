// reCAPTCHA v3 helper
declare global {
  interface Window {
    grecaptcha: {
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

// Replace this with your actual reCAPTCHA v3 site key
export const RECAPTCHA_SITE_KEY = '6LdASgwsAAAAAOchNw06D6sJZq3hdRsbBbgr0DQ1';

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
