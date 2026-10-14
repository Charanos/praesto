import * as Select from "@radix-ui/react-select";
import { useRef, useState, type ReactNode } from "react";
import { Icon } from "./icons";
import "./select-field.css";
export type SelectOption = {
  value: string | number;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
};
/** One menu surface, including when the trigger lives inside a native dialog. */
export default function SelectField({
  label,
  value,
  options,
  onChange,
  tone = "light",
}: {
  label: string;
  value: string | number;
  options: SelectOption[];
  onChange: (value: string) => void;
  tone?: "light" | "inverse";
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  return (
    <Select.Root
      value={String(value)}
      onValueChange={onChange}
      onOpenChange={(open) => {
        if (open)
          setContainer(trigger.current?.closest("dialog") ?? document.body);
      }}
    >
      <Select.Trigger
        ref={trigger}
        className="select-trigger"
        aria-label={label}
      >
        <Select.Value />
        <Select.Icon>
          <Icon name="down" size={14} />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal container={container}>
        <Select.Content
          className="select-popover"
          data-tone={tone}
          position="popper"
          align="start"
          sideOffset={8}
          collisionPadding={12}
        >
          <Select.ScrollUpButton className="select-scroll">
            <Icon name="up" size={14} />
          </Select.ScrollUpButton>
          <Select.Viewport className="select-options">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={String(option.value)}
                className="select-option"
                data-option-value={option.value}
                disabled={option.disabled}
              >
                {option.icon && (
                  <span className="select-option-icon" aria-hidden="true">
                    {option.icon}
                  </span>
                )}
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="select-option-check">
                  <Icon name="check" size={15} />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="select-scroll">
            <Icon name="down" size={14} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
