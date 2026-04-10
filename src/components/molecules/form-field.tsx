
import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  className?: string;
  required?: boolean;
}

/**
 * FormField Molecule.
 * Combines Label, Input, and Error message into a single reusable component.
 *
 * @param {FormFieldProps} props - The component props.
 * @returns {JSX.Element} The rendered form field.
 */
export function FormField({
  id,
  name,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  className,
  required = false,
}: FormFieldProps) {
  return (
    <Field className={cn("space-y-1.5", className)}>
      <FieldLabel htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </FieldLabel>
      <Input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        className={cn(
          "h-12 bg-background border-input px-4 rounded-xl focus-visible:ring-primary/20 transition-all",
          error && "border-destructive focus-visible:ring-destructive/20"
        )}
      />
      {error && <FieldError errors={[{ message: error }]} />}
    </Field>
  );
}
