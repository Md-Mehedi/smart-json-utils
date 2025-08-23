export interface ArrayField {
  fullPath: string;
  name: string;
  depth: number;
  items: number;
  fields: { [key: string]: FieldInfo };
  parentPath: string;
}

export interface FieldInfo {
  types: string[];
  primaryType: string;
}

export interface ArraySortPreferences {
  [arrayPath: string]: string;
}

export interface ArrayNestingPreferences {
  [arrayPath: string]: boolean;
}

export interface ArraySortOrderPreferences {
  [arrayPath: string]: 'asc' | 'desc';
}

export interface JsonNode {
  key?: string;
  value: any;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null';
  depth: number;
  expanded?: boolean;
  children?: JsonNode[];
}

export interface SortingOptions {
  sortKeys: boolean;
  sortArrays: boolean;
  arraySortPreferences: ArraySortPreferences;
  arrayNestingPreferences: ArrayNestingPreferences;
  arraySortOrderPreferences?: ArraySortOrderPreferences;
  masterSortOrder?: 'asc' | 'desc';
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
} 