# Phase A — Account Remotion Preview parity diagnostic

Generated: 2026-09-07T01:00:40.182Z

## texture-thin-branding

- **useBackground:** Texture
- **brandingComplete:** false
- **assemblyParity:** mismatch
- **recommendation:** client-resolver

### Branding gaps

- `texture.url` (partial): Texture row exists but media url is missing or unresolved.

### templateVariation diff

- **texture**
  - saved: `{"name":"Paper","repeat":"cover","scale":"100%","overlay":{"opacity":0.5,"blendMode":"multiply"}}`
  - builder: `{"name":"Paper","url":"/uploads/paper_texture.png","repeat":"cover","scale":"100%","overlay":{"opacity":0.5,"blendMode":"multiply"}}`

### Notes

- theme.theme.useBackground (Solid) differs from template_option.useBackground (Texture); saved reader prefers template_option.

## Raw JSON

```json
{
  "useBackground": "Texture",
  "brandingGaps": [
    {
      "field": "texture.url",
      "status": "partial",
      "detail": "Texture row exists but media url is missing or unresolved."
    }
  ],
  "brandingComplete": false,
  "assemblyParity": "mismatch",
  "templateVariationDiff": [
    {
      "path": "texture",
      "saved": {
        "name": "Paper",
        "repeat": "cover",
        "scale": "100%",
        "overlay": {
          "opacity": 0.5,
          "blendMode": "multiply"
        }
      },
      "builder": {
        "name": "Paper",
        "url": "/uploads/paper_texture.png",
        "repeat": "cover",
        "scale": "100%",
        "overlay": {
          "opacity": 0.5,
          "blendMode": "multiply"
        }
      }
    }
  ],
  "recommendation": "client-resolver",
  "notes": [
    "theme.theme.useBackground (Solid) differs from template_option.useBackground (Texture); saved reader prefers template_option."
  ]
}
```
