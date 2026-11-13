/**
 * forms — input & feedback primitives (1.4.0 "Input & Feedback Layer";
 * 2.3.0 grows Select / Checkbox / Avatar).
 *
 * Six controls wired to the form styles in css/forms.css: `<Input>`,
 * `<TextArea>`, `<ToggleSwitch>`, `<Select>`, `<Checkbox>`, `<Avatar>`.
 *
 * THE ERROR FLAG: `error` is a STATE FLAG, never rendered as text.
 * `<Input error>` / `<TextArea error>` only flip the DOM attribute
 * `aria-invalid="true"` (css/forms.css paints the --party-peach border —
 * the owner-spec'd error state, attribute-driven like the nav's
 * aria-current). Consumers render their own error message next to the
 * field, where they control its id/aria-describedby wiring. This keeps
 * the components flat: ONE element, no message slot, no wrapper.
 *
 * PEAK PRUNING: `<ToggleSwitch>` renders EXACTLY ONE element — a
 * `<button role="switch">` whose knob is the CSS ::before pseudo-element
 * (css/forms.css). No wrapper div, no hidden checkbox, no inner span.
 * The visual state is the attribute: aria-checked drives both the Teal
 * track and the knob travel.
 */
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { type PartyTokenName } from "./primitives.js";
/**
 * Props for `<Input>` — every native input attribute flows through,
 * plus the `error` flag.
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /**
     * Error STATE flag — a boolean or a truthy string. Never rendered as
     * text: it only sets `aria-invalid="true"` on the element, which
     * css/forms.css answers with the --party-peach error border. Render
     * your own message beside the field (wire its id via
     * aria-describedby yourself).
     */
    error?: boolean | string;
}
/**
 * `<Input>` — the inset-well text field.
 *
 * ONE `<input className="ptp-input">` — props spread onto it verbatim.
 * Styling (inset well, hairline border, Flamingo focus ring, peach
 * error border) lives entirely in css/forms.css.
 *
 * @example
 * ```tsx
 * <Input
 *   value={name}
 *   onChange={(e) => setName(e.target.value)}
 *   error={name.length === 0 && "Name is required"}
 *   aria-describedby="name-error" // your own message element
 * />
 * ```
 */
export declare function Input({ error, ...rest }: InputProps): import("react").JSX.Element;
/**
 * Props for `<TextArea>` — every native textarea attribute flows
 * through, plus the `error` flag.
 */
export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /**
     * Error STATE flag — a boolean or a truthy string. Never rendered as
     * text: it only sets `aria-invalid="true"` (→ the --party-peach
     * border). Render your own message beside the field.
     */
    error?: boolean | string;
}
/**
 * `<TextArea>` — the inset-well multi-line field.
 *
 * ONE `<textarea className="ptp-textarea">` — props spread onto it
 * verbatim. Same doctrine as `<Input>`: the error flag is a state, the
 * message is yours.
 *
 * @example
 * ```tsx
 * <TextArea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
 * ```
 */
export declare function TextArea({ error, ...rest }: TextAreaProps): import("react").JSX.Element;
/**
 * Props for `<ToggleSwitch>`. Controlled by the consumer: pass `checked`
 * and react to `onToggle(next)` — the component owns no state.
 */
export interface ToggleSwitchProps {
    /** Whether the switch is on (drives aria-checked → the Teal track). */
    checked: boolean;
    /** Called with the NEXT value on click: `onToggle(!checked)`. */
    onToggle?: (next: boolean) => void;
    /**
     * The accessible name (aria-label) — the button carries no visible
     * text. Optional in the type, but every real switch should name
     * itself.
     */
    label?: string;
}
/**
 * `<ToggleSwitch>` — THE toggle. Exactly ONE DOM element.
 *
 * A `<button type="button" role="switch" class="ptp-switch">` whose knob
 * is the ::before pseudo-element (css/forms.css: 20px travel on
 * aria-checked, dark knob on the Teal track — the on-cake echo). Click
 * fires `onToggle(!checked)`; state stays with you.
 *
 * @example
 * ```tsx
 * const [on, setOn] = useState(false);
 * <ToggleSwitch checked={on} onToggle={setOn} label="Enable notifications" />
 * ```
 */
export declare function ToggleSwitch({ checked, onToggle, label }: ToggleSwitchProps): import("react").JSX.Element;
/**
 * Props for `<Select>` — every native select attribute flows through,
 * plus the `error` flag and the accessible name.
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    /**
     * Error STATE flag — a boolean or a truthy string. Never rendered as
     * text: it only sets `aria-invalid="true"` (→ the --party-peach
     * border, the v1.4.0 doctrine). Render your own message beside the
     * field.
     */
    error?: boolean | string;
    /**
     * The accessible name (aria-label) for the native select — same
     * convention as `<ToggleSwitch label>`: optional in the type, but an
     * unnamed control is a bug waiting for a screen reader.
     */
    label?: string;
}
/**
 * `<Select>` — the native dropdown with the token chevron.
 *
 * ONE justified wrapper: `<span class="ptp-select">` (positioned anchor)
 * → `<select class="ptp-select__native">` + `<Icon name="ChevronDown"
 * class="ptp-select__chevron">`. THE WRAPPER IS STRUCTURAL, not
 * decorative: `appearance: none` strips the UA arrow, and the custom
 * chevron needs a positioned ancestor to hang off (`position: absolute`
 * resolves against the nearest positioned ancestor — without the span
 * the icon would anchor to the card). The native `<select>` itself keeps
 * every native behavior — keyboard, forms, mobile pickers — nothing is
 * re-implemented. "ChevronDown" is gate-probed against the live
 * lucide-react icons map (the "Music" lesson: an icon name that is not a
 * map key renders a blank square).
 *
 * @example
 * ```tsx
 * <Select
 *   label="Dietary preference"
 *   value={diet}
 *   onChange={(e) => setDiet(e.target.value)}
 * >
 *   <option value="none">No preference</option>
 *   <option value="vegetarian">Vegetarian</option>
 *   <option value="vegan">Vegan</option>
 * </Select>
 * ```
 */
export declare function Select({ error, label, children, ...rest }: SelectProps): import("react").JSX.Element;
/**
 * Props for `<Checkbox>`. Controlled by the consumer: pass `checked`
 * and react to `onToggle(next)` — the component owns no state.
 */
export interface CheckboxProps {
    /** Whether the box is checked (drives the Teal fill + the checkmark). */
    checked: boolean;
    /** Called with the NEXT value on change: `onToggle(!checked)`. */
    onToggle?: (next: boolean) => void;
    /** The visible label text beside the box (rendered in a span). */
    label?: string;
}
/**
 * `<Checkbox>` — the native check with the on-cake checkmark.
 *
 * `<label class="ptp-checkbox">` (THE justified wrapper: a native
 * checkbox's click-to-toggle label association is a semantic necessity
 * — the `<label>` element IS the feature, wiring pointer and screen-
 * reader clicks to the input with zero JS) → `<input type="checkbox"
 * class="ptp-checkbox__input">` + the label text span. `appearance:
 * none` strips the UA chrome; the checked state paints the Teal
 * (`--color-cake-secondary`) fill and reveals the ::after checkmark —
 * dark `--color-on-cake` ink on the Teal track, the on-cake doctrine.
 * State stays the native input's `checked` attribute — attribute-driven,
 * like every other control in this package.
 *
 * @example
 * ```tsx
 * const [agreed, setAgreed] = useState(false);
 * <Checkbox checked={agreed} onToggle={setAgreed} label="Send me the invite" />
 * ```
 */
export declare function Checkbox({ checked, onToggle, label }: CheckboxProps): import("react").JSX.Element;
/**
 * Props for `<Avatar>` — initials are DERIVED, never stored.
 *
 * `size` is a `32 | 40` union (grid-perfect diameters only) and
 * `ringToken` accepts `--party-*` tokens exclusively (PartyTokenName —
 * avatar rings are CONTENT decoration, the Rule of Engagement).
 */
export interface AvatarProps {
    /** The person's name — the initials source AND the accessible name. */
    name: string;
    /** Diameter in px — grid-perfect: 32 (default) or 40. */
    size?: 32 | 40;
    /**
     * A `--party-*` content token for a 2px ring. Typed AND guarded:
     * a structural token slipped past the types (JS consumers) warns and
     * renders WITHOUT the ring — an avatar without its ring is still an
     * avatar, so this guard drops the decoration, not the component
     * (the PartyBadge/ProgressBar guards render null because there is
     * nothing left to show; here there is — the initials).
     */
    ringToken?: PartyTokenName;
}
/**
 * `<Avatar>` — the initials disc.
 *
 * ONE `<span class="ptp-avatar">` — width/height set INLINE from `size`
 * (the two grid-perfect diameters), `aria-label={name}`, and — when
 * `ringToken` is present — the ring as an INLINE `border: 2px solid
 * var(token)`. BORDER, NOT box-shadow: the e1 doctrine — separation is
 * drawn with hairlines/borders, never shadows; a ring drawn as a shadow
 * would be a banned box-shadow with a token painted on it. Initials:
 * word-initials of the whitespace-split name, first two, uppercased;
 * an empty name renders an empty span (still correctly sized).
 *
 * @example
 * ```tsx
 * <Avatar name="Ana Souza" />
 * <Avatar name="Priya Nair" size={40} ringToken="--party-mauve-soft" />
 * ```
 */
export declare function Avatar({ name, size, ringToken }: AvatarProps): import("react").JSX.Element;
