# Login and Forgot Password Spam Suppression

This document defines the recommended approach for suppressing spam, brute-force attempts, and abusive repeated requests against the login and forgot-password flows in the NestJS app that proxies to Strapi.

The goal is to stop abusive traffic **before it reaches Strapi**, protect the email reset flow from abuse, reduce account enumeration risk, and keep the experience clean for normal users.

---

## Core Approach

For these authentication flows, protection should be applied in layers:

1. **Rate limit auth endpoints**
2. **Track repeated failures by both IP and email/identifier**
3. **Apply progressive delay and cooldown windows**
4. **Use generic responses to avoid account enumeration**
5. **Log suspicious behaviour for monitoring and future blocking**

This should sit in the NestJS auth layer, not only in Strapi.

Preferred flow:

`Form -> NestJS auth endpoint -> spam suppression checks -> Strapi`

---

## Why This Should Live in NestJS

Because the app already appears to be routing login and forgot-password through its own auth endpoints, the NestJS layer is the correct place to apply spam suppression.

This ensures:

- abusive requests are stopped before hitting Strapi
- the forgot-password flow does not spam the email provider
- login abuse can be managed in one controlled layer
- all auth-related protections stay consistent across the app

---

## 1. Rate Limit the Login Endpoint

The login endpoint should have a strict per-IP rate limit.

Recommended starting point:

- **5 requests per minute per IP**
- **20 requests per 15 minutes per IP**

This helps stop basic hammering and obvious repeated automated attempts.

If this threshold is exceeded, return:

- `429 Too Many Requests`

The rate limit should be applied to the NestJS login route before any request is forwarded to Strapi.

---

## 2. Rate Limit the Forgot Password Endpoint

Forgot-password is also a common abuse target.

Attackers may use it to:

- flood a mailbox with reset emails
- probe whether accounts exist
- abuse the email sending service

Recommended starting point:

- **3 requests per 15 minutes per IP**
- **2 requests per 15 minutes per email address**

This endpoint should be more tightly controlled than login because every successful pass-through may trigger email-related work downstream.

---

## 3. Track Both IP and Email Address

IP-based limiting is not enough on its own.

An attacker can rotate IPs, so the system should also track attempts against the submitted identifier:

- email address
- username
- or whichever login identifier is used

Recommended controls:

### Login

- **5 failed attempts per IP per minute**
- **10 failed attempts per email per 15 minutes**
- **20 failed attempts per email per hour**

### Forgot Password

- **2 requests per email per 15 minutes**
- **5 requests per email per hour**

This makes it harder to abuse a single account even if the attacker is spreading requests across multiple addresses or proxies.

---

## 4. Use Progressive Delay and Cooldown Windows

A hard lockout alone is usually not ideal.

It can become frustrating for real users and can be abused as a denial-of-service mechanism if someone intentionally triggers lockouts against real accounts.

A better approach is:

- allow a small number of normal attempts
- start slowing repeated failures
- then apply temporary cooldowns

Recommended pattern:

- attempts **1–3**: no delay
- attempt **4**: 1 second delay
- attempt **5**: 2 second delay
- attempt **6**: 10 minute cooldown
- repeated abuse after that: 15 minute cooldown

This creates friction for bots and scripts while still being tolerable for a legitimate user who mistypes their password once or twice.

---

## 5. Use Generic Auth Responses

Responses should not reveal whether an account exists.

### Login

Always return a generic error such as:

`Invalid email or password`

Do not return:

- `Email not found`
- `Password incorrect`
- `User does not exist`

### Forgot Password

Always return a success-style generic message such as:

`If an account exists for that email, a reset link has been sent.`

Do not reveal whether the email exists in the system.

This reduces account enumeration risk and keeps the external behaviour of the endpoint consistent.

---

## 6. Log Suspicious Behaviour

All auth endpoints should generate structured logs for suspicious behaviour.

Recommended things to log:

- IP address
- identifier/email used
- endpoint name
- timestamp
- result (`success`, `failed`, `rate_limited`, `cooldown_blocked`)
- user agent if needed

This makes it easier to:

- spot brute-force or password spraying attempts
- identify repeated abuse patterns
- support future IP blocking or WAF rules
- debug user complaints about temporary blocks

These logs should be useful for monitoring, but should not leak sensitive detail back to the client.

---

## 7. Prefer Redis for Counters and Cooldowns

Counters and cooldown windows should be stored in **Redis**, not just in memory.

Why:

- survives app restarts better
- works across multiple instances
- supports TTL-based counters cleanly
- centralises auth abuse tracking

Examples of what to store:

- login attempts by IP
- failed login attempts by email
- forgot-password requests by IP
- forgot-password requests by email
- cooldown expiry timestamps

---

## 8. Recommended Initial Rules

These are a good first-pass ruleset for the current app.

### Login

- **5 requests per minute per IP**
- **20 requests per 15 minutes per IP**
- **10 failed attempts per email per 15 minutes**
- **generic error response**
- **progressive delay after repeated failures**
- **10 minute cooldown after threshold breach**

### Forgot Password

- **3 requests per 15 minutes per IP**
- **2 requests per 15 minutes per email**
- **always return the same generic success message**
- **block or cooldown repeated abuse before proxying to Strapi**

---

## 9. Placement in the Current Architecture

This protection should live in the NestJS auth proxy layer.

That means:

- the form submits to the NestJS auth endpoint
- NestJS checks throttling, cooldowns, and counters
- NestJS decides whether the request should proceed
- only approved requests are forwarded to Strapi

This keeps Strapi protected from unnecessary auth spam and gives the app a single place to enforce behaviour.

---

## 10. Implementation Notes

A clean implementation would likely include:

- a rate-limit guard or middleware for auth routes
- Redis-backed attempt tracking service
- helper utilities for normalising email addresses before counting attempts
- progressive delay logic for failed logins
- generic response handling for login and forgot-password
- structured auth event logging

---

## Recommended Direction

The recommended baseline for this project is:

- **NestJS throttling on auth endpoints**
- **Redis-backed counters and cooldowns**
- **per-IP and per-email tracking**
- **generic auth responses**
- **progressive backoff for repeated failures**
- **logging for suspicious activity**

This gives strong protection without making the normal login experience unnecessarily heavy.
