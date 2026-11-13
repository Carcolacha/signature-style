/**
 * forms — input & feedback primitives (1.4.0 "Input & Feedback Layer";
 * 2.3.0 grows Select / Checkbox / Avatar; 2.4.0 "Form Wrappers &
 * Editorial Primitives" grows FormField / RadioCardGroup).
 *
 * Eight controls + the accessible wrapper, wired to the form styles in
 * css/forms.css: `<FormField>`, `<Input>`, `<TextArea>`,
 * `<ToggleSwitch>`, `<Select>`, `<Checkbox>`, `<Avatar>`,
 * `<RadioCardGroup>`.
 *
 * THE ERROR FLAG: `error` is a STATE FLAG, never rendered as text.
 * `<Input error>` / `<TextArea error>` only flip the DOM attribute
 * `aria-invalid="true"` (css/forms.css paints the --party-peach border —
 * the owner-spec'd error state, attribute-driven like the nav's
 * aria-current). Consumers render their own error message next to the
 * field, where they control its id/aria-describedby wiring. This keeps
 * the components flat: ONE element, no message slot, no wrapper.
 *
 * 2.4.0 — THE WRAPPER ARRIVES: `<FormField>` is the ACCESSIBLE wrapper
 * for the bare controls (label + control + hint/error slot). The v1.4.0
 * doctrine still holds — the CONTROL stays wrapper-free — but the
 * around-the-control scaffold (label element, hint, role="alert" error)
 * is now one import. THE CONSUMER WIRES id/htmlFor: pass the same id to
 * the control and htmlFor to the field; the package renders no ids it
 * cannot verify. `<RadioCardGroup>` is the card-metaphor radio: a
 * native input per option (keyboard + forms for free), visually hidden,
 * with the LABEL as the card — `:has()` paints the focus ring and the
 * selected state (css/forms.css documents the no-:has degrade).
 *
 * PEAK PRUNING: `<ToggleSwitch>` renders EXACTLY ONE element — a
 * `<button role="switch">` whose knob is the CSS ::before pseudo-element
 * (css/forms.css). No wrapper div, no hidden checkbox, no inner span.
 * The visual state is the attribute: aria-checked drives both the Teal
 * track and the knob travel.
 */
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
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
/**
 * Props for `<FormField>` — the accessible around-the-control scaffold.
 *
 * THE CONSUMER WIRES id/htmlFor: pass the SAME `id` to the control you
 * render as `children` and the same string as `htmlFor` here. The field
 * deliberately renders no ids of its own — a generated id it cannot
 * verify against the child would be an a11y lie with extra steps.
 */
export interface FormFieldProps {
    /** The visible label text (rendered in the `.ptp-form-field__label`). */
    label: string;
    /**
     * The control's `id` — YOU also pass it to the child control; this
     * prop only wires the label's `htmlFor` to it.
     */
    htmlFor?: string;
    /**
     * The muted helper line under the control. REPLACED by `error` when
     * both are present — a field in the error state shows the error,
     * never the hint (one message slot, two states).
     */
    hint?: string;
    /**
     * The error message — rendered with role="alert" (announced without a
     * focus change) and REPLACING the hint. This is the MESSAGE slot; the
     * control's own error STATE is still `aria-invalid` (v1.4.0 doctrine).
     * Wire them together: `error` here + `aria-invalid` on the child.
     */
    error?: string;
    /** The control (an `<Input>`, `<TextArea>`, `<Select>`, …). */
    children?: ReactNode;
}
/**
 * `<FormField>` — the accessible wrapper (2.4.0).
 *
 * `<div class="ptp-form-field">` (flex column, tight gap — the css
 * carries the `__field` slot contract ON the root, one class fewer) →
 * `<label class="ptp-form-field__label" htmlFor={htmlFor}>` → children
 * (the bare control, untouched) → hint OR error. Error replaces hint —
 * never both: a field shows ONE message. The error span is
 * `role="alert"` (--party-peach, the v1.4.0 error token — owner spec).
 * The v1.4.0 "no message slot" doctrine applies to the CONTROL
 * (`<Input>` stays ONE element); the FIELD wrapper is the sanctioned
 * around-the-control scaffold for consumers who want label+message
 * wiring without hand-rolling it.
 *
 * @example
 * ```tsx
 * <FormField label="Guest name" htmlFor="guest-name" hint="As it appears on the invite">
 *   <Input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} />
 * </FormField>
 * ```
 */
export declare function FormField({ label, htmlFor, hint, error, children }: FormFieldProps): import("react").JSX.Element;
/** One option of a `<RadioCardGroup>`: the value it submits, its visible label, an optional description line. */
export interface RadioCardOption {
    /** The value `onChange` receives when this card's radio is picked. */
    value: string;
    /** The card's visible label. */
    label: string;
    /** The muted second line under the label (rendered only when present). */
    description?: string;
}
export interface RadioCardGroupProps {
    /** The native radio group name — every input in the group wears it. */
    name: string;
    /** The options, rendered once in the given order. */
    options: RadioCardOption[];
    /** The selected value (controlled — the component owns no state). */
    value: string;
    /** Called with the picked option's value: `onChange(option.value)`. */
    onChange: (value: string) => void;
    /** The accessible name for the radiogroup (e.g. "RSVP"). */
    label?: string;
}
/**
 * `<RadioCardGroup>` — the card-metaphor radio group (2.4.0).
 *
 * `<div role="radiogroup" aria-label={label} class="ptp-radio-cards">`
 * → one `<label class="ptp-radio-card [--selected]">` per option — THE
 * WRAPPER IS A SEMANTIC NECESSITY (same doctrine as `<Checkbox>`: the
 * label element wires pointer and screen-reader clicks to the native
 * input with zero JS) → `<input type="radio" class="ptp-radio-card__input">`
 * (visually hidden — position absolute, opacity 0) + the body span with
 * the label and the optional description. THE NATIVE INPUT KEEPS THE
 * CONTRACT: arrow-key group navigation, form submission, `checked` —
 * nothing re-implemented. The card's selected state rides BOTH a class
 * (`--selected`, for consumers) and the attribute path
 * (`:has(input:checked)`, the state machine — the attribute is the
 * state). Keyboard focus lands on the hidden input and css/forms.css
 * rings the CARD via `:has(input:focus-visible)` — the flamingo ring
 * doctrine through one modern selector (browsers without `:has()` lose
 * only that ring; the group stays fully operable — documented degrade).
 *
 * @example
 * ```tsx
 * const [rsvp, setRsvp] = useState("attending");
 * <RadioCardGroup
 *   label="RSVP"
 *   name="rsvp"
 *   value={rsvp}
 *   onChange={setRsvp}
 *   options={[
 *     { value: "attending", label: "Attending", description: "See you there" },
 *     { value: "maybe", label: "Maybe" },
 *     { value: "declined", label: "Can't make it" },
 *   ]}
 * />
 * ```
 */
export declare function RadioCardGroup({ name, options, value, onChange, label }: RadioCardGroupProps): import("react").JSX.Element;
