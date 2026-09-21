import type { UseFormRegisterReturn } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { UNIDADES_VOLUMEN } from "@/lib/constants";

type VolumeFieldProps = {
  amountRegistration: UseFormRegisterReturn;
  unitRegistration: UseFormRegisterReturn;
  amountHasError?: boolean;
  unitHasError?: boolean;
};

/** Campo de volumen disponible — HU-05. Cantidad numérica + selector de unidad. */
export function VolumeField({
  amountRegistration,
  unitRegistration,
  amountHasError,
  unitHasError,
}: VolumeFieldProps) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-3">
      <Input
        id="volumen_disponible"
        type="number"
        step="any"
        min="0"
        inputMode="decimal"
        placeholder="Ej. 500"
        hasError={amountHasError}
        {...amountRegistration}
      />
      <Select
        id="unidad_volumen"
        hasError={unitHasError}
        defaultValue=""
        className="w-40"
        {...unitRegistration}
      >
        <option value="" disabled>
          Unidad
        </option>
        {UNIDADES_VOLUMEN.map((unidad) => (
          <option key={unidad.value} value={unidad.value}>
            {unidad.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
