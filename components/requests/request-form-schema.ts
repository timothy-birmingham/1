/** react-hook-form works with plain strings for <input type="date">, while
 * the Zod schemas in lib/validations/request.ts coerce those strings into
 * Date objects on submit. Keeping a separate "form values" shape (with
 * string dates) avoids fighting zodResolver's input/output type mismatch --
 * validation still runs through the same Zod schema, just invoked manually
 * in the submit handler instead of wired in automatically. */
export interface RequestFormValues {
  employeeName: string;
  roleTitle: string;
  department: string;
  officeLocation: string;
  neededByDate: string;
  isNewHire: boolean;
  startDate: string;
  notes: string;
  equipmentItems: { name: string; quantity: number }[];
}

export const EMPTY_REQUEST_FORM_VALUES: RequestFormValues = {
  employeeName: "",
  roleTitle: "",
  department: "",
  officeLocation: "",
  neededByDate: "",
  isNewHire: false,
  startDate: "",
  notes: "",
  equipmentItems: [],
};
