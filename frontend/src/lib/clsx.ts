// Junta las clases CSS ignorando los valores vacios

export default function clsx(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
