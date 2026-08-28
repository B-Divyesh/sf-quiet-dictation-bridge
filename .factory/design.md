# Quiet Dictation Bridge — visual thesis

## Direction: cinematic environmental art

The product lives in the charged quiet between a shared office and a private
thought. Its visual world is a late-evening open-plan studio: desks fall into
deep blue shadow while one phone-sized pool of amber light creates a protected
zone. The image is not decoration; it explains the job in a glance — proximity
and intention make speech private.

The interface is deliberately single-mode, dark, and explicitly paints every
surface. A light theme would weaken the visual metaphor and add glare in a
close-mic context. Status surfaces resemble a film slate: calm when idle, a
precise amber edge while listening, and green only after delivery.

## Palette

| Token | Value | Purpose |
| --- | --- | --- |
| Night | `#080d12` | page background, the quiet office |
| Ink | `#0f171e` | raised surfaces |
| Slate | `#17242d` | controls and dividers |
| Paper | `#f4f1e8` | primary text |
| Fog | `#a9b6bc` | secondary text (7.3:1 on Night) |
| Ember | `#f5a84b` | attention, microphone state |
| Ember ink | `#211307` | text on Ember |
| Signal | `#70d6a2` | confirmed and connected |
| Warning | `#ffd47a` | recoverable problem |
| Danger | `#ff8b82` | destructive/error state |

The palette comes from sodium-vapour office windows against a blue-black city
night. Color is always paired with text, icon shape, and/or state labels.

## Typography

- Display: `Arial Narrow`, `Aptos Narrow`, system sans-serif — condensed,
  editorial scene-setting without downloading a font.
- Interface/body: `Inter`-like platform system stack (`ui-sans-serif`, system
  UI) for legibility and zero font payload.
- Scale: 14 / 16 / 20 / 28 / clamp(44–76) px, with body never below 16 px.
  Numeric timing and connection codes use tabular figures and `ui-monospace`.

## Spacing and shape

An 8 px base rhythm with 4 px for optical adjustments. Main content caps at
1200 px; reading copy caps at 68 characters. Corners use 10, 18, and 28 px —
soft enough to feel handled, never bubbly. Touch targets are at least 48 px.
Hairlines are low-contrast and grouping relies on space before boxes.

## Interaction grammar

- The phone and desktop are two "positions" on one local stage. Choosing a
  role changes the active panel in place; browser back remains meaningful.
- Pairing is explicit and reciprocal: invitation out, answer back, connected.
  Codes are never implied to be cloud accounts.
- The microphone control behaves physically: press and hold (or Space/Enter),
  release to stop. A visible `Listening` label and expanding solid ring make
  the dangerous state unmistakable. A short local tone/haptic happens before
  confirmed text is sent.
- Desktop delivery never pretends to type across the browser sandbox. Each
  received phrase has a large Copy button and a clear "paste in your field"
  instruction.

## Motion

UI transitions last 180–260 ms and use only opacity and transform. The hero
scene has a single slow light sweep that pauses naturally; recording has one
restrained breathing ring, never a decorative loop. Under
`prefers-reduced-motion: reduce`, movement and smooth scrolling are removed;
state changes remain through labels, border weight, and color.

## Asset plan and provenance

### `public/art/quiet-desk.webp`

- Purpose: responsive hero scene / product-world explanation.
- Prompt (2026-08-28): “Use case: stylized-concept. Asset type: wide landing
  page hero. A cinematic open-plan office after dusk, viewed from a human eye
  height across quiet desks. In the near foreground, a small unbranded phone
  rests close to a seated worker’s hands, creating a restrained warm amber pool
  of light; the distant office recedes into blue-black shadow and rain-softened
  windows. The person is anonymous and only partially seen from behind; no
  face. The phone screen contains only an abstract solid recording ring, no UI
  text. Editorial cinematic realism, subtle 35 mm film grain, believable worn
  desk materials, low-key lighting, deep navy, slate, warm sodium amber, small
  mint confirmation glint. Wide 3:2 composition with clean shadowed negative
  space on the left for overlaid headline. No text, no watermark, no logos, no
  brands, no sci-fi holograms, no extra phones, no visible microphones, no
  anatomy distortion.”
- Generator: Azure AI Foundry image deployment `factory-image` through the
  factory-provided `/opt/fleet/lib/gen-image.sh`; generated 2026-08-28.
- License/provenance: original AI-generated asset for this product; no source
  photograph, person identity, logo, or copyrighted character supplied.
- Review checklist: natural hands/silhouette, no pseudo-text, no branding,
  credible device, coherent lighting, usable negative space.

The source PNG and prompt sidecar are kept under `assets/src/`. The shipping
WebP is resized/optimized and must remain under 300 KB.

## Responsive intent

Desktop stages the scene and setup side by side. At 390 px the artwork becomes
a shallow establishing frame, role choices stack, pairing codes wrap without
horizontal scroll, and the hold control moves into thumb reach. Secondary
explanation follows the working bridge rather than preceding it.
