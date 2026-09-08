export type TableColumn = {
  field: string;
  header: string;
  /** Clases Tailwind opcionales para esa columna (ancho fijo, alinear, ocultar en mobile). */
  class?: string;
};

export type SelectFilterOption = { label: string; value: string };

export type TableSelectFilter = {
  field: string;
  placeholder: string;
  options: SelectFilterOption[];
};
