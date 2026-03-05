/**
 * Utilitário para concatenar classes CSS condicionalmente.
 * Útil com Tailwind e componentes que aceitam className.
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
