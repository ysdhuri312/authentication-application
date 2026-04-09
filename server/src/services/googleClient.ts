/** @format */

import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';

export const getGoogleClient = () => {
  const clientId = env.GOOGLE_CLIENT_ID;
  const clientSecret = env.GOOGLE_CLIENT_SECRET;
  const redirectUri = env.GOOGLE_REDIRECT_URL;

  return new OAuth2Client({
    clientId,
    clientSecret,
    redirectUri,
  });
};
