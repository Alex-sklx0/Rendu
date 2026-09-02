import type { UseFormRegisterReturn } from "react-hook-form";
import { Select } from "@/components/ui/Select";
import { FAMILIAS_MATERIAL } from "@/lib/constants";

type FamilySelectProps = {
  registration: UseFormRegisterReturn;
  hasError?: boolean;
  id?: string;
};

/** Selector de familia de material — HU-04. Lista única fuente de verdad en lib/constants.ts. */
export function FamilySelect({ registration, hasError, id = "id_familia" }: FamilySelectProps) {
  return (
    <Select id={id} hasError={hasError} defaultValue="" {...registration}>
      <option value="" disabled>
        Selecciona una familia de material
      </option>
      {FAMILIAS_MATERIAL.map((familia) => (
        <option key={familia.id} value={familia.id}>
          {familia.nombre}
        </option>
      ))}
    </Select>
  );
}
