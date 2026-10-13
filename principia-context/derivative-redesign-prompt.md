# Codex prompt — Principia: hub y Derivadas

Actualización: la aplicación se llama Principia y es un hub de calculadoras para ingeniería y desarrollo de software. Derivadas es el primer módulo. Implementa `START-HERE.md`: catálogo en `/`, registro de metadata, shell compartido y Derivadas en `/calculators/derivatives`. Este brief visual se aplica a ambas páginas; no implementes calculadoras futuras en esta entrega.

Redesign and implement the existing derivative calculator using the attached V7 screenshot and https://www.v7labs.com/ as visual references. The first screenshot shows the current calculator; the second is the target reference. Inspect the repository and existing context files before editing. Work within the current architecture and installed stack.

The desired direction is a dark, restrained mathematical workspace with the typographic confidence and compositional discipline of the reference. Translate its visual principles into a working calculator. This new brief supersedes conflicting visual recommendations in `docs/05-design-and-ux.md`; retain the mathematical, architecture, accessibility and error-handling requirements. Update that document to reflect the implemented design.

## 1. Address the current problems

The current screenshot has a split sans/blue-italic headline, a large boxed editor, repeated bordered containers, a crowded example-button row, default-looking graph controls, and raw LaTeX in the expanded steps. Fix these specific issues. Changing the background color alone does not satisfy the redesign.

## 2. Visual system

- Use charcoal rather than pure black: start around `#202020` for the page and `#262626` only where a functional surface needs separation. Warm white primary text; muted gray secondary text. Measure contrast before finalizing colors.
- Use Cal Sans 400 normal for headings and branding, and Google Sans 400/500 normal for text and UI. Preserve the math renderer's own fonts and code monospace. Configure both through the installed next/font/google exports and self-host their build output. Do not claim these are V7's exact fonts.
- Keep the heading short: “Calculadora de derivadas.” Optional supporting sentence: “Calcula la derivada y explora su pendiente.” Preserve the app's current UI language.
- Heading approximately 48–64px desktop and 34–42px mobile, responsive to available space. Controls/body 14–16px with readable contrast; formulas sized for legibility. Use tabular numerals for changing values.
- Use consistent alignment, deliberate spacing and thin separators. Start with a 1200–1280px content width, 32–48px desktop gutters and 20px mobile gutters.
- Limit rounded containers. The main action can be a compact warm-white pill with dark text; inputs and utility controls have modest corners. Remove unnecessary shadows and decorative borders.
- Give color a mathematical purpose: warm-white solid function, muted amber dashed derivative, gray tangent. Verify contrast and distinguish curves by labels and line styles as well as color.

## 3. Rebuild the hierarchy

Keep the header compact: product name and functional Examples/Help actions only if those destinations exist. Remove ornamental labels, redundant subtitles and marketing sections.

Place the short heading above a compact calculation row: `f(x) =`, the MathLive editor and one primary Derivar action. Keep examples and clear/reset secondary; use a compact examples menu or a few text actions instead of six equally prominent boxed buttons. Preserve editor labeling, keyboard access and the virtual keyboard.

Immediately below, create one integrated workspace. On desktop, the graph occupies roughly two-thirds of the width on the left; the result and inspection occupy the right third, separated by a subtle rule. On mobile, stack input, result, graph and steps. At approximately 1440×900, the input and a meaningful part of the interactive graph should be visible without scrolling. Do not copy the reference's tall marketing hero.

Render the derivative as the main formula in the result area, without another nested card. Place x, f(x), f′(x), tangent and relevant domain notices in a compact hierarchy. Keep derivation steps collapsed initially and visually secondary. Use “Ver pasos” instead of exposing engine terminology.

## 4. Polish the actual interaction

Restyle the real MathLive editor, graph legend, slider, numeric input and reset controls consistently. Keep pointer drag and equivalent keyboard/numeric controls. Use a subtle graph grid; no decorative page-wide grid, particle field or animated background.

Render every formula in the steps through the existing mathematical renderer. Translate known rule IDs through a small Spanish copy map if the UI is Spanish; preserve accurate fallback descriptions for unmapped rules. Do not invent steps or leave raw LaTeX visible. Long formulas may scroll locally without making the page overflow.

Use brief opacity/color transitions around 150–200ms for feedback. Respect reduced motion. The point, displayed slope and tangent must update together without spring delays or artificial interpolation.

Preserve idle, loading, current/stale result, partial success, invalid input, undefined point, timeout and recovery states. Keep essential error notices visible next to their affected control. Place detailed limitations in accessible help or expandable details, rather than a technical paragraph permanently beneath the graph.

## 5. Implementation and acceptance

Implement the redesign, rather than stopping after an audit. Reuse existing components, mathematical adapters, workers and tests. Keep semantic HTML and visible focus. Add dependencies only where an existing capability cannot meet the requirement.

Validate the real application at 360px, 768px and 1440px widths, with keyboard navigation, reduced motion, long formulas and expanded steps. Exercise the cubic example, a constant, invalid syntax, `1/x` at zero, loading and partial results. Preserve domain holes, cancellation and the rule that the tangent to f uses f′.

Run the repository's relevant checks and production build. Capture screenshots of the implemented page if browser tooling is available, inspect them and fix obvious alignment, contrast and overflow problems. If visual verification is unavailable, report that limitation explicitly.

Finish with a brief report: files changed, major design decisions, checks actually run and remaining issues. The redesign succeeds when the mathematical workflow is clear immediately, formulas render correctly, controls feel like one system, and typography and spacing establish hierarchy without decorative clutter.
