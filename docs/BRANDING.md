# ElasticOS Branding & Design Language

**Vibe:** "We're serious, but not intimidating."

---

## Typography

**Font:** DM Sans — humanist sans-serif with soft curves and precise geometry. High legibility at all sizes. Technical but friendly. Works equally well for marketing headlines and dense dashboards.

| Use | Style |
|-----|-------|
| **Headlines** | Large, bold, confident, often sentence-case |
| **Body text** | Regular/light weights, generous line height (1.6–1.75) |
| **UI & numbers** | Clear, neutral, optimized for data readability |

---

## Colour

**System:** Minimal + expressive.

| Role | Token | Usage |
|------|-------|-------|
| **Primary text** | `foreground` | Black/near-black (#0f172a) |
| **Background** | `background` | White dominant (#ffffff) |
| **Cool greys** | `border`, `surface`, `foreground-muted/subtle` | UI structure, dividers, secondary text (blue-tinted) |

**Accent gradient:** Signature multi-colour — yellow → green → turquoise → blues. Use **sparingly**: hero sections, illustrations, highlights. Accents never overwhelm content; they guide attention.

**Effect:** Trustworthy and clean (finance) + modern and creative (tech/startups). Instantly recognizable even without a logo.

---

## Brand Personality

- **Developer-first**
- Calm, confident, quietly powerful
- "Invisible infrastructure" rather than flashy

---

## Visual System

- **White space:** Lots of it
- **Hierarchy:** Strong typographic hierarchy
- **UI components:** Rounded corners (`rounded-ui`, `rounded-ui-sm`)
- **Motion:** Subtle depth and micro-interactions (150–300ms, ease-out)
- **Product UIs:** Showcased as the hero — realistic, not abstract hype
- **Logos & imagery:** Neutral partner logos (monochrome); illustrations technical, modular, abstract

---

## Tailwind / CSS Variables

Design tokens live in `globals.css` and `tailwind.config.ts`. Use semantic tokens:

- `text-foreground`, `text-foreground-muted`, `text-foreground-subtle`
- `bg-background`, `bg-background-alt`, `bg-surface`
- `border-border`, `border-border-subtle`
- `rounded-ui`, `rounded-ui-sm`
- `gradient-accent`, `gradient-accent-text` (hero/highlights only)
- `btn-interactive`, `card-interactive`, `focus-ring`
