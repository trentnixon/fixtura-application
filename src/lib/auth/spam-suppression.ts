import * as Sentry from "@sentry/nextjs";

/**
 * In-memory storage for tracking auth attempts.
 * Resets on app restart.
 */
type AuthAttempt = {
  count: number;
  lastAttempt: number;
  backoffLevel: number; // 0=none, 1=1s, 2=2s, 3=cooldown
  cooldownUntil: number;
};

class SpamSuppressionStore {
  private static instance: SpamSuppressionStore;
  private ipStore: Map<string, AuthAttempt> = new Map();
  private emailStore: Map<string, AuthAttempt> = new Map();

  // Thresholds from [.comms/login-forgot-password-spam-suppression.md]
  private readonly LOGIN_IP_LIMIT = 5; // per minute
  private readonly LOGIN_IP_WINDOW = 60 * 1000;
  private readonly LOGIN_EMAIL_LIMIT = 10; // per 15 minutes
  private readonly LOGIN_EMAIL_WINDOW = 15 * 60 * 1000;

  private readonly FORGOT_IP_LIMIT = 3; // per 15 minutes
  private readonly FORGOT_IP_WINDOW = 15 * 60 * 1000;
  private readonly FORGOT_EMAIL_LIMIT = 2; // per 15 minutes
  private readonly FORGOT_EMAIL_WINDOW = 15 * 60 * 1000;

  private readonly COOLDOWN_DURATION = 10 * 60 * 1000; // 10 minutes

  private constructor() {
    // Periodic cleanup every 30 minutes to prevent memory leaks
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 30 * 60 * 1000);
    }
  }

  public static getInstance(): SpamSuppressionStore {
    if (!SpamSuppressionStore.instance) {
      SpamSuppressionStore.instance = new SpamSuppressionStore();
    }
    return SpamSuppressionStore.instance;
  }

  /**
   * Checks if a login attempt is allowed based on IP and Email.
   * Returns { allowed: boolean, delayMs: number, reason?: string }
   */
  public checkLogin(
    ip: string,
    email: string,
  ): { allowed: boolean; delayMs: number; reason?: string } {
    const now = Date.now();
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Check Cooldowns
    const ipData = this.ipStore.get(ip);
    const emailData = this.emailStore.get(normalizedEmail);

    if (ipData && ipData.cooldownUntil > now) {
      return { allowed: false, delayMs: 0, reason: "ip_cooldown" };
    }
    if (emailData && emailData.cooldownUntil > now) {
      return { allowed: false, delayMs: 0, reason: "email_cooldown" };
    }

    // 2. Check Rate Limits (Simple count in window)
    if (
      ipData &&
      ipData.count >= this.LOGIN_IP_LIMIT &&
      now - ipData.lastAttempt < this.LOGIN_IP_WINDOW
    ) {
      return { allowed: false, delayMs: 0, reason: "ip_rate_limit" };
    }
    if (
      emailData &&
      emailData.count >= this.LOGIN_EMAIL_LIMIT &&
      now - emailData.lastAttempt < this.LOGIN_EMAIL_WINDOW
    ) {
      return { allowed: false, delayMs: 0, reason: "email_rate_limit" };
    }

    // 3. Calculate Delay
    const delayMs = this.calculateDelay(ipData, emailData);

    return { allowed: true, delayMs };
  }

  /**
   * Checks if a forgot password attempt is allowed.
   */
  public checkForgotPassword(ip: string, email: string): { allowed: boolean; reason?: string } {
    const now = Date.now();
    const normalizedEmail = email.toLowerCase().trim();

    const ipData = this.ipStore.get(ip);
    const emailData = this.emailStore.get(normalizedEmail);

    if (
      ipData &&
      ipData.count >= this.FORGOT_IP_LIMIT &&
      now - ipData.lastAttempt < this.FORGOT_IP_WINDOW
    ) {
      return { allowed: false, reason: "ip_rate_limit" };
    }
    if (
      emailData &&
      emailData.count >= this.FORGOT_EMAIL_LIMIT &&
      now - emailData.lastAttempt < this.FORGOT_EMAIL_WINDOW
    ) {
      return { allowed: false, reason: "email_rate_limit" };
    }

    return { allowed: true };
  }

  /**
   * Records a successful attempt (resets counters/backoff).
   */
  public recordSuccess(ip: string, email: string) {
    this.ipStore.delete(ip);
    this.emailStore.delete(email.toLowerCase().trim());
  }

  /**
   * Records a failed attempt (increments counters/backoff).
   */
  public recordFailure(ip: string, email: string) {
    const now = Date.now();
    const normalizedEmail = email.toLowerCase().trim();

    this.updateEntry(this.ipStore, ip, now);
    this.updateEntry(this.emailStore, normalizedEmail, now);

    // Logs for security monitoring
    this.logSuspiciousActivity(ip, normalizedEmail, "failed_login");
  }

  /**
   * Records a forgot password attempt (increments counters).
   */
  public recordForgotPasswordAttempt(ip: string, email: string) {
    const now = Date.now();
    const normalizedEmail = email.toLowerCase().trim();

    this.updateEntry(this.ipStore, ip, now);
    this.updateEntry(this.emailStore, normalizedEmail, now);
  }

  /**
   * Internal helper to update attempt data.
   */
  private updateEntry(store: Map<string, AuthAttempt>, key: string, now: number) {
    const current = store.get(key) || {
      count: 0,
      lastAttempt: 0,
      backoffLevel: 0,
      cooldownUntil: 0,
    };

    // Reset count if window has passed
    const isNewWindow = now - current.lastAttempt > this.LOGIN_EMAIL_WINDOW; // Use largest window for reset
    const newCount = isNewWindow ? 1 : current.count + 1;

    let newBackoff = current.backoffLevel;
    let newCooldown = current.cooldownUntil;

    // Progressive Backoff Logic from [.comms]
    // 1-3: none, 4: 1s, 5: 2s, 6: 10m cooldown
    if (newCount >= 6) {
      newBackoff = 3;
      newCooldown = now + this.COOLDOWN_DURATION;
    } else if (newCount === 5) {
      newBackoff = 2;
    } else if (newCount === 4) {
      newBackoff = 1;
    }

    store.set(key, {
      count: newCount,
      lastAttempt: now,
      backoffLevel: newBackoff,
      cooldownUntil: newCooldown,
    });
  }

  private calculateDelay(ipData?: AuthAttempt, emailData?: AuthAttempt): number {
    const backoffLevel = Math.max(ipData?.backoffLevel || 0, emailData?.backoffLevel || 0);
    if (backoffLevel === 1) return 1000; // 1s
    if (backoffLevel === 2) return 2000; // 2s
    return 0;
  }

  private cleanup() {
    const now = Date.now();
    const expiry = 60 * 60 * 1000; // 1 hour

    for (const [key, data] of this.ipStore.entries()) {
      if (now - data.lastAttempt > expiry) this.ipStore.delete(key);
    }
    for (const [key, data] of this.emailStore.entries()) {
      if (now - data.lastAttempt > expiry) this.emailStore.delete(key);
    }
  }

  private logSuspiciousActivity(ip: string, email: string, event: string) {
    console.log(
      `[AUTH_SPAM_BLOCK] ${event} - IP: ${ip}, Email: ${email}, Time: ${new Date().toISOString()}`,
    );
    // Optional: Send to Sentry for monitoring
    Sentry.addBreadcrumb({
      category: "auth",
      message: `Suspicious activity: ${event} for ${email} from ${ip}`,
      level: "warning",
    });
  }
}

export const spamSuppression = SpamSuppressionStore.getInstance();
