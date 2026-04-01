/** HTTP-only cookie storing the Strapi JWT for the members area. */
export const AUTH_COOKIE_NAME = "fixtura_members_jwt";

/** Default cookie lifetime when Strapi does not dictate expiry (seconds). */
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
