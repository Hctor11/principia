"use client";
import { useEffect, useRef } from "react";
import type { MathfieldElement } from "mathlive";
export default function MathEditor({
  value,
  onChange,
  onSubmit,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const field = useRef<MathfieldElement | null>(null);
  const change = useRef(onChange);
  const submit = useRef(onSubmit);
  useEffect(() => {
    change.current = onChange;
    submit.current = onSubmit;
  }, [onChange, onSubmit]);
  useEffect(() => {
    let active = true;
    let cleanup = () => {};
    import("mathlive")
      .then(({ MathfieldElement }) => {
        if (!active || !host.current) return;
        MathfieldElement.fontsDirectory = "/mathlive/fonts";
        MathfieldElement.soundsDirectory = null;
        const element = new MathfieldElement();
        element.value = value;
        element.id = "function-editor";
        element.setAttribute("aria-label", "Función de x");
        element.setAttribute("aria-describedby", "input-help");
        element.mathVirtualKeyboardPolicy = "manual";
        const listener = () => change.current(element.value);
        element.addEventListener("input", listener);
        const enter = (event: KeyboardEvent) => {
          if (
            event.key === "Enter" &&
            !event.isComposing &&
            !event.shiftKey &&
            !event.ctrlKey &&
            !event.altKey &&
            !event.metaKey
          ) {
            event.preventDefault();
            submit.current();
          }
        };
        element.addEventListener("keydown", enter);
        host.current.replaceChildren(element);
        field.current = element;
        cleanup = () => {
          element.removeEventListener("input", listener);
          element.removeEventListener("keydown", enter);
          element.remove();
          field.current = null;
        };
      })
      .catch(() => {
        if (host.current)
          host.current.textContent =
            "No pudimos cargar el editor. Recarga la página.";
      });
    return () => {
      active = false;
      cleanup();
    };
    // The editor owns its selection; subsequent values are synchronized separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (field.current && field.current.value !== value)
      field.current.value = value;
  }, [value]);
  return <div ref={host} className="editor-host" />;
}
