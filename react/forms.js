import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * forms — input & feedback primitives (1.4.0 "Input & Feedback Layer";
 * 2.3.0 grows Select / Checkbox / Avatar; 2.4.0 "Form Wrappers &
 * Editorial Primitives" grows FormField / RadioCardGroup; 2.4.1
 * "Intuitive Form Anatomy & Alignment Fix" grows FormField.required /
 * FormField.prefix and the visible switch label; 2.5.0 "Ergonomic Form
 * Rules" REWORKS FormField into the top-down anatomy (description above
 * the input, prefix/suffix chips in the owning well, validMessage slot,
 * the error shake) and grows PasswordInput; 3.0.0 "Symmetrical Forms"
 * REVERSES the owner's own 2.5.0 call — helpers (description + hint)
 * move BELOW the control into the .ptp-form-field__helpers slot, the
 * label row gets the fixed 20px alignment rail, and infoTooltip adds
 * the pure-CSS ⓘ bubble. THE A11Y PRESERVATION makes the reversal safe:
 * the description id rides aria-describedby onto the control
 * (cloneElement merge) — screen readers still announce the format rule
 * (the GOV.UK concern survives the visual move).
 *
 * Nine controls + the accessible wrapper, wired to the form styles in
 * css/forms.css: `<FormField>`, `<Input>`, `<TextArea>`,
 * `<ToggleSwitch>`, `<Select>`, `<Checkbox>`, `<Avatar>`,
 * `<RadioCardGroup>`, `<PasswordInput>`.
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
 * PEAK PRUNING, EVOLVED (2.4.1): `<ToggleSwitch>` still renders the
 * pill as ONE element — a `<button role="switch">` whose knob is the
 * CSS ::before pseudo-element (css/forms.css). What changed is the
 * label contract: `label` used to be aria-label ONLY (orphaned
 * switches — a mute decoration floating in the card with no visible
 * name). Now a present `label` ALSO renders as visible text: the
 * pill (`.ptp-switch__pill`, every selector migrated off the old
 * `.ptp-switch` name) + a `.ptp-switch__text` span inside the
 * `.ptp-switch` wrapper. THE WRAPPER IS JUSTIFIED — it is the
 * pill + visible-text composition (the same sanction as
 * `.ptp-select`'s chevron anchor), NOT decoration: without it the
 * flex pairing of control and caption is impossible. Only the pill
 * is interactive; the text is visual (the button keeps aria-label so
 * the accessible name survives regardless of the text span).
 * The visual state is the attribute: aria-checked drives both the
 * Teal track and the knob travel.
 */
import { cloneElement, isValidElement, useId, useState } from "react";
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
 * `<FormField>` — the accessible wrapper (2.4.0; grown 2.4.1, reworked
 * 2.5.0, SYMMETRIZED 3.0.0).
 *
 * `<div class="ptp-form-field">` (flex column, tight gap — the css
 * carries the `__field` slot contract ON the root, one class fewer).
 * THE 3.0.0 SYMMETRICAL ANATOMY (the owner's reversal of the 2.5.0
 * top-down: helpers move BELOW the control — top-down labels, bottom-up
 * helpers, every side-by-side field aligning on both rails):
 *
 *   1. The label ROW — `.ptp-form-field__label-row` (fixed 20px
 *      min-height = the 1.25rem grid step, so side-by-side fields'
 *      labels align on the same baseline): the PROMOTED label
 *      (text-main, 0.875rem, weight 500) + the optional aria-hidden
 *      `__required` peach asterisk + the optional 3.0.0 `__info` ⓘ
 *      button (infoTooltip; pure-CSS bubble above, hover + focus).
 *   2. The control zone — bare children (old behavior, existing call
 *      sites keep working), or — when `prefix`/`suffix` are present —
 *      the `.ptp-form-field__well` adornment zone: mono `__chip`s
 *      flanking the bare control. The well OWNS the border/focus ring
 *      (`data-invalid` flips it peach and fires the shake).
 *   3. THE HELPERS SLOT (3.0.0 — below the well):
 *      `.ptp-form-field__helpers` (min-height 20px, flex wrap tight
 *      gap) carries the description (format examples — "120", "5
 *      numbers only · e.g., 79901") and the hint. THE REVERSAL IS
 *      DOCUMENTED IN css/forms.css; THE A11Y PRESERVATION LIVES HERE:
 *      the description renders with a generated id and FormField wires
 *      it onto the control via aria-describedby (cloneElement merge —
 *      the GOV.UK concern survives the visual move: screen readers
 *      still announce the format rule when the input takes focus).
 *      Multi-child consumers (no single control to wire) keep the old
 *      manual contract.
 *   4. The validation zone at the bottom — ONE line, error first:
 *      `error` (role="alert", peach) → `validMessage` (party-green).
 *      `hint` no longer lives here — it joined the helpers slot.
 *
 * @example
 * ```tsx
 * <FormField
 *   label="Postal Code"
 *   htmlFor="zip"
 *   infoTooltip="Drives the catering headcount"
 *   description="5 numbers only · e.g., 79901"
 *   validMessage={/^\d{5}$/.test(zip) ? "Valid ZIP" : undefined}
 *   error={zip !== "" && !/^\d{5}$/.test(zip) ? "Postal codes are 5 digits" : undefined}
 * >
 *   <Input id="zip" inputMode="numeric" />
 * </FormField>
 * ```
 */
export function FormField({ label, htmlFor, description, hint, error, validMessage, required = false, prefix, suffix, infoTooltip, children, }) {
    // The adornment zone (2.5.0): prefix/suffix present → the control
    // rides in the justified __well flex wrapper, mono chips flanking it,
    // the well owning the border, focus ring and error state. Neither
    // adornment → children stay DIRECT children (zero new DOM, peak
    // pruning — every 2.4.x call site keeps rendering untouched).
    const hasWell = prefix !== undefined || suffix !== undefined;
    // 3.0.0 A11Y PRESERVATION: the helpers' description carries a
    // generated id, wired onto the CONTROL via aria-describedby (merged
    // with any consumer-provided value) — the format rule is announced
    // even though it now renders BELOW the input.
    const descId = useId();
    const describedBy = description !== undefined && isValidSingleChild(children)
        ? [children.props["aria-describedby"], descId].filter(Boolean).join(" ")
        : undefined;
    const controlChild = describedBy !== undefined
        ? cloneElement(children, {
            "aria-describedby": describedBy,
        })
        : children;
    const control = hasWell ? (_jsxs("span", { className: "ptp-form-field__well", "data-invalid": !!error || undefined, children: [prefix !== undefined && (_jsx("span", { className: "ptp-form-field__chip", children: prefix })), controlChild, suffix !== undefined && (_jsx("span", { className: "ptp-form-field__chip ptp-form-field__chip--right", children: suffix }))] })) : (controlChild);
    return (_jsxs("div", { className: "ptp-form-field", children: [_jsxs("div", { className: "ptp-form-field__label-row", children: [_jsxs("label", { className: "ptp-form-field__label", htmlFor: htmlFor, children: [label, required && (_jsx("span", { className: "ptp-form-field__required", "aria-hidden": "true", children: "*" }))] }), infoTooltip !== undefined && (_jsx("button", { type: "button", className: "ptp-form-field__info", title: infoTooltip, "aria-label": `Info: ${infoTooltip}`, "data-tooltip": infoTooltip, children: _jsx(Icon, { name: "Info", "aria-hidden": true }) }))] }), control, (description !== undefined || hint !== undefined) && (_jsxs("div", { className: "ptp-form-field__helpers", children: [description !== undefined && (_jsx("span", { className: "ptp-form-field__desc", id: descId, children: description })), hint !== undefined && (_jsx("span", { className: "ptp-form-field__hint", children: hint }))] })), error !== undefined ? (_jsx("span", { className: "ptp-form-field__error", role: "alert", children: error })) : validMessage !== undefined ? (_jsx("span", { className: "ptp-form-field__valid", children: validMessage })) : null] }));
}
/** Single valid element = wireable via cloneElement (the describedby merge). */
function isValidSingleChild(children) {
    return isValidElement(children);
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
    return (_jsx("div", { role: "radiogroup", "aria-label": label, className: "ptp-radio-cards", children: options.map((option) => {
            // 2.5.0 — descriptions ENFORCED at runtime: a description-less
            // card renders as a label-only stub and breaks the balanced
            // grid read. The type stays optional (no semver break in a
            // minor release); JS consumers get the dev-time warning.
            if (option.description === undefined) {
                console.warn(`[signature-style] RadioCardGroup option "${option.label}" has no description — cards read as stubs without their second line; pass a description for every option.`);
            }
            return (_jsxs("label", { className: value === option.value
                    ? "ptp-radio-card ptp-radio-card--selected"
                    : "ptp-radio-card", children: [_jsx("input", { type: "radio", className: "ptp-radio-card__input", name: name, value: option.value, checked: value === option.value, onChange: () => onChange(option.value) }), _jsxs("span", { className: "ptp-radio-card__body", children: [_jsx("span", { className: "ptp-radio-card__label", children: option.label }), option.description !== undefined && (_jsx("span", { className: "ptp-radio-card__desc", children: option.description }))] })] }, option.value));
        }) }));
}
/** The four strength stages, index = score − 1 (score 0 shows none). */
const PASSWORD_STAGES = ["Weak", "Fair", "Good", "Strong"];
/**
 * `<PasswordInput>` — the password well with the live strength meter
 * (2.5.0).
 *
 * Anatomy, top-down inside the FormField scaffold:
 *
 *   1. The label + the fixed format description ("8+ chars · mix
 *      cases, numbers, symbols") — the 2.5.0 description-above
 *      contract, shipped by `<FormField>`.
 *   2. The `.ptp-form-field__well.ptp-password` — a bare
 *      `type={show ? "text" : "password"}` input (the well owns the
 *      border; the scoped kill strips the field chrome) + the
 *      `.ptp-password__toggle` eye button (aria-label + aria-pressed;
 *      Icon "Eye"/"EyeOff" — both gate-probed against the live lucide
 *      map).
 *   3. The `.ptp-password__meter` — ONE `<div role="progressbar">`
 *      (aria-valuemin 0 / max 4 / now score) carrying four `<span>`
 *      segments and the `data-score` attribute. The css paints the
 *      filled prefix: 1 → peach, 2 → yellow (--party-yellow, the
 *      token this release exists for), 3 → sky, 4 → green.
 *   4. The stage label (Weak/Fair/Good/Strong), colored to match.
 *   5. Four `.ptp-password__pill` condition spans ("8+ chars",
 *      "Uppercase", "Number", "Symbol") — `data-satisfied` flips them
 *      to the 20% party-green wash.
 *
 * THE SCORE IS HONEST BY CONSTRUCTION: it is the count of satisfied
 * rules — nothing tuned, nothing weighted. Unlike every other control
 * here, this component DOES render an id it can verify: it owns both
 * the label and the input, so `useId()` wires them legitimately (the
 * FormField "consumer wires ids" doctrine applies to fields whose
 * children the package cannot see — this one is all package).
 *
 * @example
 * ```tsx
 * const [pw, setPw] = useState("");
 * <PasswordInput label="Password" value={pw} onChange={setPw} />
 * ```
 */
export function PasswordInput({ label = "Password", value, onChange }) {
    const id = useId();
    const [show, setShow] = useState(false);
    const rules = [
        { label: "8+ chars", satisfied: value.length >= 8 },
        { label: "Uppercase", satisfied: /[A-Z]/.test(value) },
        { label: "Number", satisfied: /\d/.test(value) },
        { label: "Symbol", satisfied: /[^A-Za-z0-9]/.test(value) },
    ];
    const score = rules.filter((rule) => rule.satisfied).length;
    const stage = score === 0 ? "" : (PASSWORD_STAGES[score - 1] ?? "");
    return (_jsxs(FormField, { label: label, htmlFor: id, description: "8+ chars \u00B7 mix cases, numbers, symbols", children: [_jsxs("span", { className: "ptp-form-field__well ptp-password", children: [_jsx("input", { id: id, type: show ? "text" : "password", className: "ptp-password__native", value: value, onChange: (event) => onChange?.(event.target.value) }), _jsx("button", { type: "button", className: "ptp-password__toggle", "aria-label": show ? "Hide password" : "Show password", "aria-pressed": show, onClick: () => setShow((current) => !current), children: _jsx(Icon, { name: show ? "EyeOff" : "Eye", "aria-hidden": true }) })] }), _jsxs("span", { className: "ptp-password__meter-row", children: [_jsxs("span", { className: "ptp-password__meter", role: "progressbar", "aria-label": "Password strength", "aria-valuemin": 0, "aria-valuemax": 4, "aria-valuenow": score, "data-score": score, children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }), _jsx("span", { className: "ptp-password__stage", "data-score": score, children: stage })] }), _jsx("span", { className: "ptp-password__pills", children: rules.map((rule) => (_jsx("span", { className: "ptp-password__pill", ...(rule.satisfied ? { "data-satisfied": true } : {}), children: rule.label }, rule.label))) })] }));
}
