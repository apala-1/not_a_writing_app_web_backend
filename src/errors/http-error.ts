import { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return error.issues.map(i => {
    const path = i.path?.length ? ` (${i.path.join(".")})` : "";
    return `${i.message}${path}`;
  }).join(", ");
}
