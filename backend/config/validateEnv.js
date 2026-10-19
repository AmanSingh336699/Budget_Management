// Validates required environment variables at server startup

export const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error(`[CRITICAL SECURITY CONFIG] Missing required environment variables: ${missing.join(', ')}`);
    console.error('Server execution halted. Please set them in your .env file.');
    process.exit(1);
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn('[SECURITY WARNING] JWT_SECRET is shorter than 32 characters. Consider using a 256-bit key for production.');
  }

  if (['secret', 'change_me', 'your_jwt_secret', '123456'].includes(process.env.JWT_SECRET.toLowerCase())) {
    console.error('[CRITICAL SECURITY CONFIG] JWT_SECRET is set to an insecure default value.');
    process.exit(1);
  }

  if (!process.env.ALLOWED_ORIGIN) {
    console.warn('[SECURITY WARNING] ALLOWED_ORIGIN not set, defaulting to http://localhost:5174');
  }
};
