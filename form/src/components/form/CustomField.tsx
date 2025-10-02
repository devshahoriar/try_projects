"use client";

import type { ControllerRenderProps, FieldValues, Path } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";

import { useFormContext } from "./Form";

type CustomFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label?: string;
  children: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
};

const CustomField = <T extends FieldValues>({
  name,
  label,
  children,
}: CustomFieldProps<T>) => {
  const control = useFormContext<T>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>{children(field)}</FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CustomField;
