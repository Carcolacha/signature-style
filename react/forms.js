import { jsx as _jsx } from "react/jsx-runtime";
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
export function ToggleSwitch({ checked, onToggle, label }) {
    return (_jsx("button", { type: "button", role: "switch", className: "ptp-switch", "aria-checked": checked, "aria-label": label, onClick: () => onToggle?.(!checked) }));
}
