/**
 * forms — input & feedback primitives (1.4.0 "Input & Feedback Layer").
 *
 * Three flat, single-element controls wired to the form styles in
 * css/forms.css: `<Input>`, `<TextArea>`, `<ToggleSwitch>`.
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
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
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
