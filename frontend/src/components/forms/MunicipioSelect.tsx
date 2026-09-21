import type { UseFormRegisterReturn } from "react-hook-form";
import { Select } from "@/components/ui/Select";
import { MUNICIPIOS_VALLE_ABURRA } from "@/lib/constants";

type MunicipioSelectProps = {
  registration: UseFormRegisterReturn;
  hasError?: boolean;
  id?: string;
};

/** Selector de municipio del Valle de Aburrá — HU-06. */
export function MunicipioSelect({
  registration,
  hasError,
  id = "municipio",
}: MunicipioSelectProps) {
  return (
    <Select id={id} hasError={hasError} defaultValue="" {...registration}>
      <option value="" disabled>
        Valle de Aburrá
      </option>
      {MUNICIPIOS_VALLE_ABURRA.map((municipio) => (
        <option key={municipio} value={municipio}>
          {municipio}
        </option>
      ))}
    </Select>
  );
}
