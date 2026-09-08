export type TableColumn = {
  field: string;
  header: string;
  /** Clases Tailwind opcionales para esa columna (ancho fijo, alinear, ocultar en mobile). */
  class?: string;
  /**
   * Ordenable al hacer click en el header. Default `false` (opt-in): columnas
   * "pseudo-campo" (acciones, badges compuestos de más de un campo real) no deberían
   * ordenarse — que cada columna lo declare a propósito evita headers clicables que en
   * realidad no ordenan nada útil.
   */
  sortable?: boolean;
};

export type SelectFilterOption = { label: string; value: string };

export type TableSelectFilter = {
  field: string;
  placeholder: string;
  options: SelectFilterOption[];
};
