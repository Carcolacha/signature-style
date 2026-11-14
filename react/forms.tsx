/**
 * forms — input & feedback primitives (1.4.0 "Input & Feedback Layer";
 * 2.3.0 grows Select / Checkbox / Avatar; 2.4.0 "Form Wrappers &
 * Editorial Primitives" grows FormField / RadioCardGroup; 2.4.1
 * "Intuitive Form Anatomy & Alignment Fix" grows FormField.required /
 * FormField.prefix and the visible switch label; 2.5.0 "Ergonomic Form
 * Rules" REWORKS FormField into the top-down anatomy (description above
 * the input, prefix/suffix chips in the owning well, validMessage slot,
 * the error shake) and grows PasswordInput).
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

import type {
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { Icon, type PartyTokenName } from "./primitives.js";

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
export function Input({ error, ...rest }: InputProps) {
  return (
    <input
      className="ptp-input"
      {...rest}
      aria-invalid={!!error || undefined}
    />
  );
}

/**
 * Props for `<TextArea>` — every native textarea attribute flows
 * through, plus the `error` flag.
 */
export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
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
export function TextArea({ error, ...rest }: TextAreaProps) {
  return (
    <textarea
      className="ptp-textarea"
      {...rest}
      aria-invalid={!!error || undefined}
    />
  );
}

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
   * The switch's name — rendered as VISIBLE text beside the pill
   * (2.4.1; was aria-label only, which orphaned the control). The
   * pill stays the ONLY interactive element and keeps its aria-label,
   * so the accessible name never depends on the text span's DOM
   * position. Optional in the type, but every real switch should
   * name itself.
   */
  label?: string;
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
export function ToggleSwitch({ checked, onToggle, label }: ToggleSwitchProps) {
  const pill = (
    <button
      type="button"
      role="switch"
      className="ptp-switch__pill"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onToggle?.(!checked)}
    />
  );
  if (label === undefined) {
    return pill;
  }
  return (
    <span className="ptp-switch">
      {pill}
      <span className="ptp-switch__text">{label}</span>
    </span>
  );
}

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
export function Select({ error, label, children, ...rest }: SelectProps) {
  return (
    <span className="ptp-select">
      <select
        className="ptp-select__native"
        {...rest}
        aria-invalid={!!error || undefined}
        aria-label={label}
      >
        {children}
      </select>
      <Icon name="ChevronDown" className="ptp-select__chevron" aria-hidden />
    </span>
  );
}

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
export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  return (
    <label className="ptp-checkbox">
      <input
        type="checkbox"
        className="ptp-checkbox__input"
        checked={checked}
        onChange={(event) => onToggle?.(event.target.checked)}
      />
      {label !== undefined && (
        <span className="ptp-checkbox__text">{label}</span>
      )}
    </label>
  );
}

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
export function Avatar({ name, size = 32, ringToken }: AvatarProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
  const ringStyle: CSSProperties = {};
  if (ringToken !== undefined) {
    if (!ringToken.startsWith("--party-")) {
      console.warn(
        `[signature-style] dropped ring "${ringToken}" — Avatar rings accept --party-* tokens only (Rule of Engagement); rendering without the ring.`,
      );
    } else {
      ringStyle.border = `2px solid var(${ringToken})`;
    }
  }
  return (
    <span
      className="ptp-avatar"
      style={{ width: size, height: size, ...ringStyle }}
      aria-label={name}
    >
      {initials}
    </span>
  );
}

/**
 * Props for `<FormField>` — the accessible around-the-control scaffold.
 *
 * THE CONSUMER WIRES id/htmlFor: pass the SAME `id` to the control you
 * render as `children` and the same string as `htmlFor` here. The field
 * deliberately renders no ids of its own — a generated id it cannot
 * verify against the child would be an a11y lie with extra steps.
 *
 * 2.5.0 — THE TOP-DOWN ANATOMY (owner mandate, strict vertical order):
 * label → description → control → validation. `description` is the
 * ABOVE-the-input spec line (format rules live with the field's title,
 * never below the control); `hint` stays the BELOW-input helper text.
 * `prefix`/`suffix` compose the control into the `.ptp-form-field__well`
 * adornment zone (mono chips flanking a bare input); `validMessage` is
 * the live-validation success line that answers `error` in the ONE
 * validation slot at the bottom.
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
   * The muted FORMAT line ABOVE the control (2.5.0), directly below the
   * title — e.g. "5 numbers only · e.g., 79901". This is where format
   * rules live (the v2.4.1 defect: rules under the input read as an
   * error). NOT the hint: `hint` stays the below-input helper text for
   * non-format context.
   */
  description?: string;
  /**
   * The muted helper line UNDER the control (unchanged 2.4.0 semantics).
   * LOSES the priority contest in the validation zone: error →
   * validMessage → hint, one line shown, never two.
   */
  hint?: string;
  /**
   * The error message — rendered with role="alert" (announced without a
   * focus change) and WINNING the validation zone. This is the MESSAGE
   * slot; the control's own error STATE is still `aria-invalid` (v1.4.0
   * doctrine). Wire them together: `error` here + `aria-invalid` on the
   * child. A truthy `error` also flips the well's `data-invalid`
   * attribute (peach border + the shake) when the control rides one.
   */
  error?: string;
  /**
   * The live-validation SUCCESS line (2.5.0) — rendered below the
   * control in `var(--party-green)`, outranked only by `error`. The
   * "Valid ZIP" twin of the error slot: pass it when the value passes
   * your rule, e.g. `validMessage={/^\d{5}$/.test(postal) ? "Valid ZIP" : undefined}`.
   */
  validMessage?: string;
  /**
   * A literal adornment rendered BEFORE the control (2.4.1; 2.5.0
   * re-homed), e.g. `prefix="$"` for money fields. When prefix/suffix
   * are present the children are wrapped in the
   * `.ptp-form-field__well` adornment zone (THE JUSTIFIED WRAPPER: an
   * adornment composition needs a flex parent that can own the border —
   * the bare control must stay untouched inside it) with the
   * `.ptp-form-field__chip` mono span ahead of it. THE CONTRACT: the
   * children must be BARE inputs — the well owns the background,
   * border and focus ring (css/forms.css scopes
   * `.ptp-form-field__well > .ptp-input` kills). The adornment is
   * DECORATION — the value's currency belongs to the consumer's
   * placeholder/validation, never to the input's value. The chip is
   * separated from the cursor by a hairline, never glued into the label
   * (the second v2.4.1 defect: "$" concatenated into "Contribution").
   */
  prefix?: string;
  /**
   * A literal adornment rendered AFTER the control (2.5.0) — the mirror
   * of `prefix` (e.g. `suffix="kg"`), riding the same well as the right
   * chip. Same bare-input contract.
   */
  suffix?: string;
  /** The control (an `<Input>`, `<TextArea>`, `<Select>`, …). */
  children?: ReactNode;
  /**
   * Marks the field visually required (2.4.1): a `--party-peach` `*`
   * renders AFTER the label text. VISUAL ONLY — the asterisk span is
   * aria-hidden and the FIELD renders no aria-required of its own;
   * the CONTROL owns that contract. Pass it on the child yourself,
   * e.g. `<Input required aria-required="true" …>` (native inputs
   * derive aria-required from `required`) — the wrapper never speaks
   * for a control it cannot verify, the same doctrine as id/htmlFor.
   */
  required?: boolean;
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
export function FormField({
  label,
  htmlFor,
  description,
  hint,
  error,
  validMessage,
  required = false,
  prefix,
  suffix,
  children,
}: FormFieldProps) {
  // The adornment zone (2.5.0): prefix/suffix present → the control
  // rides in the justified __well flex wrapper, mono chips flanking it,
  // the well owning the border, focus ring and error state. Neither
  // adornment → children stay DIRECT children (zero new DOM, peak
  // pruning — every 2.4.x call site keeps rendering untouched).
  const hasWell = prefix !== undefined || suffix !== undefined;
  const control = hasWell ? (
    <span className="ptp-form-field__well" data-invalid={!!error || undefined}>
      {prefix !== undefined && (
        <span className="ptp-form-field__chip">{prefix}</span>
      )}
      {children}
      {suffix !== undefined && (
        <span className="ptp-form-field__chip ptp-form-field__chip--right">
          {suffix}
        </span>
      )}
    </span>
  ) : (
    children
  );
  return (
    <div className="ptp-form-field">
      <label className="ptp-form-field__label" htmlFor={htmlFor}>
        {label}
        {required && (
          <span className="ptp-form-field__required" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {description !== undefined && (
        <span className="ptp-form-field__desc">{description}</span>
      )}
      {control}
      {error !== undefined ? (
        <span className="ptp-form-field__error" role="alert">
          {error}
        </span>
      ) : validMessage !== undefined ? (
        <span className="ptp-form-field__valid">{validMessage}</span>
      ) : hint !== undefined ? (
        <span className="ptp-form-field__hint">{hint}</span>
      ) : null}
    </div>
  );
}

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
export function RadioCardGroup({ name, options, value, onChange, label }: RadioCardGroupProps) {
  return (
    <div role="radiogroup" aria-label={label} className="ptp-radio-cards">
      {options.map((option) => (
        <label
          key={option.value}
          className={
            value === option.value
              ? "ptp-radio-card ptp-radio-card--selected"
              : "ptp-radio-card"
          }
        >
          <input
            type="radio"
            className="ptp-radio-card__input"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          <span className="ptp-radio-card__body">
            <span className="ptp-radio-card__label">{option.label}</span>
            {option.description !== undefined && (
              <span className="ptp-radio-card__desc">{option.description}</span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
}
