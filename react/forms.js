import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Icon } from "./primitives.js";
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
export function Input({ error, ...rest }) {
    return (_jsx("input", { className: "ptp-input", ...rest, "aria-invalid": !!error || undefined }));
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
export function TextArea({ error, ...rest }) {
    return (_jsx("textarea", { className: "ptp-textarea", ...rest, "aria-invalid": !!error || undefined }));
}
/**
 * `<ToggleSwitch>` — THE toggle (2.4.1: visible label).
 *
 * The pill is unchanged at heart: `<button type="button" role="switch"
 * class="ptp-switch__pill">` whose knob is the ::before pseudo-element
 * (css/forms.css: 20px travel on aria-checked, dark knob on the Teal
 * track — the on-cake echo). With a `label`, the pill + text compose
 * inside `<span class="ptp-switch">` — THE JUSTIFIED WRAPPER (the
 * pill + visible-text composition; the flex pairing of control and
 * caption is impossible without it): `<span class="ptp-switch__text">`
 * carries the visible label, non-interactive. Click fires
 * `onToggle(!checked)`; state stays with you.
 *
 * @example
 * ```tsx
 * const [on, setOn] = useState(false);
 * <ToggleSwitch checked={on} onToggle={setOn} label="Enable notifications" />
 * ```
 */
export function ToggleSwitch({ checked, onToggle, label }) {
    const pill = (_jsx("button", { type: "button", role: "switch", className: "ptp-switch__pill", "aria-checked": checked, "aria-label": label, onClick: () => onToggle?.(!checked) }));
    if (label === undefined) {
        return pill;
    }
    return (_jsxs("span", { className: "ptp-switch", children: [pill, _jsx("span", { className: "ptp-switch__text", children: label })] }));
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
export function Select({ error, label, children, ...rest }) {
    return (_jsxs("span", { className: "ptp-select", children: [_jsx("select", { className: "ptp-select__native", ...rest, "aria-invalid": !!error || undefined, "aria-label": label, children: children }), _jsx(Icon, { name: "ChevronDown", className: "ptp-select__chevron", "aria-hidden": true })] }));
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
export function Checkbox({ checked, onToggle, label }) {
    return (_jsxs("label", { className: "ptp-checkbox", children: [_jsx("input", { type: "checkbox", className: "ptp-checkbox__input", checked: checked, onChange: (event) => onToggle?.(event.target.checked) }), label !== undefined && (_jsx("span", { className: "ptp-checkbox__text", children: label }))] }));
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
export function Avatar({ name, size = 32, ringToken }) {
    const initials = name
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0)
        .slice(0, 2)
        .map((word) => word.charAt(0).toUpperCase())
        .join("");
    const ringStyle = {};
    if (ringToken !== undefined) {
        if (!ringToken.startsWith("--party-")) {
            console.warn(`[signature-style] dropped ring "${ringToken}" — Avatar rings accept --party-* tokens only (Rule of Engagement); rendering without the ring.`);
        }
        else {
            ringStyle.border = `2px solid var(${ringToken})`;
        }
    }
    return (_jsx("span", { className: "ptp-avatar", style: { width: size, height: size, ...ringStyle }, "aria-label": name, children: initials }));
}
/**
 * `<FormField>` — the accessible wrapper (2.4.0; grown 2.4.1, REWORKED
 * 2.5.0 into the owner-mandated top-down anatomy).
 *
 * `<div class="ptp-form-field">` (flex column, tight gap — the css
 * carries the `__field` slot contract ON the root, one class fewer).
 * THE STRICT VERTICAL ORDER (2.5.0 owner spec, top to bottom):
 *
 *   1. `<label class="ptp-form-field__label">` — PROMOTED to the
 *      primary text voice (text-main, 0.875rem, weight 500) + the
 *      optional aria-hidden `__required` peach asterisk.
 *   2. `<span class="ptp-form-field__desc">` — the format line ABOVE
 *      the control ("5 numbers only · e.g., 79901"). Format rules live
 *      with the title, never under the input.
 *   3. The control zone — bare children (old behavior, existing call
 *      sites keep working), or — when `prefix`/`suffix` are present —
 *      the `.ptp-form-field__well` adornment zone: mono `__chip`s
 *      flanking the bare control. The well OWNS the border/focus ring
 *      (`data-invalid` flips it peach and fires the shake).
 *   4. The validation zone at the bottom — ONE line, priority order
 *      `error` (role="alert", peach) → `validMessage` (party-green) →
 *      `hint` (muted). Never two at once.
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Postal Code"
 *   htmlFor="zip"
 *   description="5 numbers only · e.g., 79901"
 *   validMessage={/^\d{5}$/.test(zip) ? "Valid ZIP" : undefined}
 *   error={zip !== "" && !/^\d{5}$/.test(zip) ? "Postal codes are 5 digits" : undefined}
 * >
 *   <Input id="zip" inputMode="numeric" />
 * </FormField>
 * ```
 */
export function FormField({ label, htmlFor, description, hint, error, validMessage, required = false, prefix, suffix, children, }) {
    // The adornment zone (2.5.0): prefix/suffix present → the control
    // rides in the justified __well flex wrapper, mono chips flanking it,
    // the well owning the border, focus ring and error state. Neither
    // adornment → children stay DIRECT children (zero new DOM, peak
    // pruning — every 2.4.x call site keeps rendering untouched).
    const hasWell = prefix !== undefined || suffix !== undefined;
    const control = hasWell ? (_jsxs("span", { className: "ptp-form-field__well", "data-invalid": !!error || undefined, children: [prefix !== undefined && (_jsx("span", { className: "ptp-form-field__chip", children: prefix })), children, suffix !== undefined && (_jsx("span", { className: "ptp-form-field__chip ptp-form-field__chip--right", children: suffix }))] })) : (children);
    return (_jsxs("div", { className: "ptp-form-field", children: [_jsxs("label", { className: "ptp-form-field__label", htmlFor: htmlFor, children: [label, required && (_jsx("span", { className: "ptp-form-field__required", "aria-hidden": "true", children: "*" }))] }), description !== undefined && (_jsx("span", { className: "ptp-form-field__desc", children: description })), control, error !== undefined ? (_jsx("span", { className: "ptp-form-field__error", role: "alert", children: error })) : validMessage !== undefined ? (_jsx("span", { className: "ptp-form-field__valid", children: validMessage })) : hint !== undefined ? (_jsx("span", { className: "ptp-form-field__hint", children: hint })) : null] }));
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
export function RadioCardGroup({ name, options, value, onChange, label }) {
    return (_jsx("div", { role: "radiogroup", "aria-label": label, className: "ptp-radio-cards", children: options.map((option) => (_jsxs("label", { className: value === option.value
                ? "ptp-radio-card ptp-radio-card--selected"
                : "ptp-radio-card", children: [_jsx("input", { type: "radio", className: "ptp-radio-card__input", name: name, value: option.value, checked: value === option.value, onChange: () => onChange(option.value) }), _jsxs("span", { className: "ptp-radio-card__body", children: [_jsx("span", { className: "ptp-radio-card__label", children: option.label }), option.description !== undefined && (_jsx("span", { className: "ptp-radio-card__desc", children: option.description }))] })] }, option.value))) }));
}
