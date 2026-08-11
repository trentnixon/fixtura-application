Absolutely — here’s a version rewritten for **your Fixtura Members application**.

````md
# Fixtura Members — Strapi Login & Password Recovery Flow

This document explains how authentication works in the **Fixtura Members application** using **Strapi Users & Permissions**.

It covers:

- member login
- forgot password
- reset password
- the required Strapi endpoints
- important implementation notes for the Fixtura frontend

This applies to **Fixtura member users**, not Strapi admin users.

---

## Scope

The Fixtura Members application uses **Strapi end-user authentication** through the **Users & Permissions plugin**.

This means the public members auth flow should use these Strapi endpoints:

- `POST /api/auth/local`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Do **not** use Strapi admin auth endpoints for the members application.

---

## Login Flow

### Purpose

Allow a Fixtura member to sign in to the members area using their email and password.

---

### Frontend Route

Typical public route:

- `/`
- or `/sign-in`

The login form should collect:

- email
- password

---

### Request to Strapi

The frontend submits a `POST` request to:

```json
POST /api/auth/local
```
````

with:

```json
{
  "identifier": "member@example.com",
  "password": "userPassword"
}
```

---

### Notes

Strapi expects the field name to be:

- `identifier`

Even if the user is signing in with an email address.

For the Fixtura frontend, this means:

- the UI should label the field as **Email**
- the request payload should send that value as `identifier`

---

### Success Response

A successful login returns:

- a JWT
- the authenticated user object

Example response:

```json
{
  "jwt": "eyJhbGci...",
  "user": {
    "id": 1,
    "username": "user"
  }
}
```

---

### Frontend Handling

For the Fixtura Members application, a successful login should:

1. receive the Strapi auth response
2. establish the application session using the chosen auth/session handling pattern
3. redirect the user into the protected members area

Typical redirect target:

```text
/app
```

or the agreed authenticated landing route.

---

### Failure Handling

If login fails:

- remain on the sign-in page
- show an inline error
- do not clear the user’s email unless there is a specific reason
- allow retry

Examples of failure states:

- invalid credentials
- missing fields
- network/server error

---

## Forgot Password Flow

### Purpose

Allow a Fixtura member to request a password reset email.

---

### Frontend Route

Typical public route:

```text
/forgot-password
```

This page should collect:

- email address

---

### Request to Strapi

The frontend submits a `POST` request to:

```json
POST /api/auth/forgot-password
```

with:

```json
{
  "email": "member@example.com"
}
```

---

### What Strapi Does

When this request succeeds, Strapi:

1. generates a reset token
2. stores it against the user record
3. sends a password reset email
4. includes a reset link containing a `code` parameter

---

### Frontend Handling

For the Fixtura Members application, after submitting forgot password:

- show a neutral success state
- tell the user to check their email
- do not reveal whether the email exists in the system

This is important for security.

Possible UI outcomes:

- redirect to `/check-email`
- or show an inline success message on the same page

---

## Reset Password Flow

### Purpose

Allow a Fixtura member to set a new password using the reset link from email.

---

### Frontend Route

Typical public route:

```text
/reset-password
```

This page should be able to read the `code` parameter from the URL.

Example:

```text
/reset-password?code=abc123
```

---

### Required Inputs

The reset password form should collect:

- new password
- confirm password

The reset code comes from the URL, not from manual user input.

---

### Request to Strapi

The frontend submits a `POST` request to:

```json
POST /api/auth/reset-password
```

with:

```json
{
  "code": "privateCode",
  "password": "newPassword",
  "passwordConfirmation": "newPassword"
}
```

---

### Frontend Handling

If reset is successful:

- show a success message or redirect
- send user back to `/sign-in`
- prompt them to sign in with their new password

If reset fails:

- remain on the reset password page
- show a clear inline error
- provide a retry path
- provide support path if needed

Examples of reset failure states:

- missing code
- invalid code
- expired code
- password mismatch
- backend error

---

## Key Strapi Endpoints Used by Fixtura Members

| Method | URL                         | Purpose                                  |
| ------ | --------------------------- | ---------------------------------------- |
| `POST` | `/api/auth/local`           | Sign in member with email and password   |
| `POST` | `/api/auth/forgot-password` | Request password reset email             |
| `POST` | `/api/auth/reset-password`  | Set a new password using reset code      |
| `POST` | `/api/auth/change-password` | Change password for authenticated member |

---

## Important Application Notes

### 1. This is for Fixtura member users only

The Fixtura Members application should use the **Users & Permissions** auth endpoints.

It should **not** use Strapi admin endpoints such as:

- `/admin/login`
- `/admin/forgot-password`
- `/admin/reset-password`

Those are only for Strapi admin panel users.

---

### 2. Email field vs identifier field

Although the Fixtura UI should ask for **Email**, Strapi login expects:

```json
{
  "identifier": "member@example.com"
}
```

So the frontend must map:

- UI field: `email`
- Strapi payload field: `identifier`

---

### 3. Forgot password responses must stay neutral

Strapi intentionally avoids revealing whether an email exists.

For the Fixtura frontend, this means the forgot password screen should always use neutral success copy such as:

> If an account exists for this email, a reset link has been sent.

Do not show different messages for known vs unknown email addresses.

---

### 4. Email setup must be configured in Strapi

For forgot password to work correctly, Strapi must have:

- email provider configured
- reset password email flow enabled
- reset password URL configured in **Users & Permissions > Advanced Settings**

Without this setup, the forgot password UI may appear to work while no email is actually sent.

---

### 5. Reset password only applies to email/password accounts

The Fixtura Members forgot password flow only works for users authenticated through the standard Strapi email/password provider.

It does not apply to OAuth/social-provider accounts unless separate logic is added later.

---

## Recommended Fixtura Public Routes

The auth flow in the Fixtura Members frontend should support:

- `/`
- `/sign-in`
- `/forgot-password`
- `/reset-password`
- `/auth-error`
- `/session-expired`
- `/help`
- `/support`

Optional utility route:

- `/check-email`

---

## Recommended UI Behaviour Summary

### Sign In

- user enters email + password
- frontend sends `identifier` + `password` to Strapi
- success redirects to protected app
- failure stays inline on page

### Forgot Password

- user enters email
- frontend sends `email` to Strapi
- UI shows neutral success confirmation
- no email existence disclosure

### Reset Password

- user arrives from emailed link with `code`
- user enters new password + confirm password
- frontend sends `code`, `password`, and `passwordConfirmation`
- success returns user to sign-in

---

## Summary

> The Fixtura Members application uses Strapi Users & Permissions for member authentication. Members sign in with email and password, request password recovery through Strapi’s forgot password endpoint, and complete recovery through the reset password endpoint using the code provided in the email link.

```

If you want, I can also turn this into a shorter **repo-ready implementation note** that reads more like an internal engineering spec than a product/auth overview.
```
