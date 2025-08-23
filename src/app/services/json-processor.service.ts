import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ArrayField, ArraySortPreferences, ArrayNestingPreferences, ArraySortOrderPreferences, ValidationResult, SortingOptions } from '../shared/interfaces/json-data.interface';

@Injectable({
  providedIn: 'root'
})
export class JsonProcessorService {
  private arraySortPreferences: ArraySortPreferences = {};
  private arrayNestingPreferences: ArrayNestingPreferences = {};
  private arraySortOrderPreferences: ArraySortOrderPreferences = {};
  private masterSortOrder: 'asc' | 'desc' = 'asc';
  private fieldSortOrder: 'asc' | 'desc' = 'asc'; // New: Controls object field/key sorting order
  private originalJsonData: any = null; // Store original data for re-analysis
  
  private arrayFieldsSubject = new BehaviorSubject<ArrayField[]>([]);
  private validationSubject = new BehaviorSubject<ValidationResult>({ isValid: true, message: 'Ready', type: 'info' });
  private processedJsonSubject = new BehaviorSubject<any>(null);

  public arrayFields$ = this.arrayFieldsSubject.asObservable();
  public validation$ = this.validationSubject.asObservable();
  public processedJson$ = this.processedJsonSubject.asObservable();

  constructor() {
    this.loadPreferences();
  }

  /**
   * Validates JSON input and analyzes array fields
   */
  validateAndAnalyzeJson(jsonString: string): void {
    if (!jsonString.trim()) {
      this.originalJsonData = null; // Clear stored data
      this.validationSubject.next({ isValid: true, message: 'Ready', type: 'info' });
      this.arrayFieldsSubject.next([]);
      return;
    }

    try {
      const parsedJson = JSON.parse(jsonString);
      this.originalJsonData = parsedJson; // Store for re-analysis
      this.validationSubject.next({ isValid: true, message: 'Valid JSON - Ready to sort!', type: 'success' });
      
      const arrayFields = this.analyzeArrayFields(parsedJson);
      this.arrayFieldsSubject.next(arrayFields);
    } catch (error) {
      this.validationSubject.next({ 
        isValid: false, 
        message: `Invalid JSON: ${(error as Error).message}`, 
        type: 'error' 
      });
      this.arrayFieldsSubject.next([]);
    }
  }

  /**
   * Processes and sorts JSON with current preferences
   */
  processJson(jsonString: string): Observable<any> {
    try {
      const parsedJson = JSON.parse(jsonString);
      const sortedJson = this.sortObjectKeys(parsedJson);
      this.processedJsonSubject.next(sortedJson);
      return this.processedJson$;
    } catch (error) {
      throw new Error(`Failed to process JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Recursively sorts object keys and applies array sorting
   */
  private sortObjectKeys(obj: any, parentPath = ''): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      // Apply array sorting based on preferences
      // For arrays, parentPath should already be the full path to this array
      const sortedArray = this.sortArray(obj, parentPath);
      return sortedArray.map((item, index) => this.sortObjectKeys(item, `${parentPath}[${index}]`));
    }

    // Sort object keys based on field sort order preference
    const sortedKeys = Object.keys(obj).sort((a, b) => {
      const comparison = a.localeCompare(b);
      return this.fieldSortOrder === 'asc' ? comparison : -comparison;
    });
    const sortedObject: any = {};

    for (const key of sortedKeys) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      // When the value is an array, we need to pass the currentPath (which includes the key)
      // When the value is an object, we also pass currentPath to continue building the path
      sortedObject[key] = this.sortObjectKeys(obj[key], currentPath);
    }

    return sortedObject;
  }

  /**
   * Sorts array based on preferences with cascading sort for tiebreakers
   */
  private sortArray(array: any[], arrayPath: string): any[] {
    if (!array.length || typeof array[0] !== 'object' || array[0] === null) {
      return [...array]; // Return copy for primitive arrays
    }

    // Normalize path by removing array indices like [0], [1], etc.
    const normalizedPath = this.normalizeArrayPath(arrayPath);
    
    // Get sorting preferences for this array using normalized path
    const sortField = this.arraySortPreferences[normalizedPath];
    const sortOrder = this.getArraySortOrder(normalizedPath);
    
    if (!sortField) {
      return [...array]; // No sorting preference set
    }

    // Create a copy to avoid mutating original
    const sortedArray = [...array];

    // Get all available fields from the first non-null object for cascading sort
    const availableFields = this.getAllAvailableFields(array);

    const result = sortedArray.sort((a, b) => {
      // Primary sort: Use the user-selected field
      const comparison = this.compareFieldValues(a, b, sortField, sortOrder);
      
      if (comparison !== 0) {
        return comparison; // Primary field has different values
      }

      // Cascading sort: Use other fields as tiebreakers
      return this.cascadingSort(a, b, availableFields, sortField, sortOrder);
    });

    return result;
  }

  /**
   * Gets all available fields from array objects
   */
  private getAllAvailableFields(array: any[]): string[] {
    const fieldSet = new Set<string>();
    
    for (const item of array) {
      if (item && typeof item === 'object') {
        this.collectObjectFields(item, '', fieldSet);
      }
    }
    
    // Return fields sorted alphabetically for consistent tiebreaking
    return Array.from(fieldSet).sort();
  }

  /**
   * Recursively collects all field paths from an object
   */
  private collectObjectFields(obj: any, prefix: string, fieldSet: Set<string>): void {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return;
    }
    
    Object.keys(obj).forEach(key => {
      const fieldPath = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      // Add this field path
      fieldSet.add(fieldPath);
      
      // Recursively explore nested objects (but not arrays to avoid complexity)
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        this.collectObjectFields(value, fieldPath, fieldSet);
      }
    });
  }

  /**
   * Compares two objects using a specific field
   */
  private compareFieldValues(a: any, b: any, field: string, sortOrder: 'asc' | 'desc'): number {
    const aValue = this.getFieldValue(a, field);
    const bValue = this.getFieldValue(b, field);

    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
    if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

    // Compare values
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      // Convert to strings for comparison
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  }

  /**
   * Performs cascading sort using additional fields as tiebreakers
   * Cascading fields are always sorted in ascending order for consistency
   */
  private cascadingSort(a: any, b: any, availableFields: string[], primaryField: string, sortOrder: 'asc' | 'desc'): number {
    // Try each field (except the primary one) as a tiebreaker
    for (const field of availableFields) {
      if (field === primaryField) {
        continue; // Skip the primary field we already compared
      }
      
      // Cascading fields always use ascending order for predictable tiebreaking
      const comparison = this.compareFieldValues(a, b, field, 'asc');
      if (comparison !== 0) {
        return comparison; // Found a difference, use this as tiebreaker
      }
    }
    
    // All fields are equal, maintain original order
    return 0;
  }

  /**
   * Normalizes array path by removing array indices
   * Example: "users[0].addresses" becomes "users.addresses"
   */
  private normalizeArrayPath(path: string): string {
    return path.replace(/\[\d+\]/g, '');
  }

  /**
   * Gets field value from object, supporting nested paths
   */
  private getFieldValue(obj: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Analyzes JSON structure to find arrays and their fields
   */
  private analyzeArrayFields(obj: any, path = '', depth = 0): ArrayField[] {
    const arrayFields: ArrayField[] = [];

    if (typeof obj !== 'object' || obj === null) {
      return arrayFields;
    }

    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;

      if (Array.isArray(value)) {
        const fieldTypes = this.analyzeArrayItems(value, currentPath);
        arrayFields.push({
          fullPath: currentPath,
          name: key,
          depth: depth,
          items: value.length,
          fields: fieldTypes,
          parentPath: path
        });

        // Recursively analyze nested structures - examine ALL items, not just the first
        // This ensures we find nested arrays even when early items are empty or incomplete
        if (value.length > 0) {
          const discoveredNestedArrays = new Map<string, ArrayField>();
          
          for (const item of value) {
            if (typeof item === 'object' && item !== null) {
              const nestedArrays = this.analyzeArrayFields(item, currentPath, depth + 1);
              
              // Merge discovered nested arrays, keeping the most complete field information
              for (const nestedArray of nestedArrays) {
                const existing = discoveredNestedArrays.get(nestedArray.fullPath);
                if (!existing || Object.keys(nestedArray.fields).length > Object.keys(existing.fields).length) {
                  discoveredNestedArrays.set(nestedArray.fullPath, nestedArray);
                }
              }
            }
          }
          
          arrayFields.push(...Array.from(discoveredNestedArrays.values()));
        }
      } else if (typeof value === 'object' && value !== null) {
        // Recursively check nested objects
        arrayFields.push(...this.analyzeArrayFields(value, currentPath, depth));
      }
    }

    return arrayFields;
  }

  /**
   * Analyzes array items to determine available fields for sorting
   */
  private analyzeArrayItems(array: any[], arrayPath = ''): { [key: string]: { types: string[], primaryType: string } } {
    const fieldTypes: { [key: string]: Set<string> } = {};
    const includeNested = this.arrayNestingPreferences[arrayPath] !== false;

    for (const item of array) {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        let fields: { [key: string]: string };

        if (includeNested) {
          fields = this.flattenObjectFields(item);
        } else {
          fields = this.getPrimitiveFields(item);
        }

        for (const [fieldPath, fieldType] of Object.entries(fields)) {
          if (!fieldTypes[fieldPath]) {
            fieldTypes[fieldPath] = new Set();
          }
          fieldTypes[fieldPath].add(fieldType);
        }
      }
    }

    // Convert sets to arrays and determine primary type
    const result: { [key: string]: { types: string[], primaryType: string } } = {};
    for (const [field, types] of Object.entries(fieldTypes)) {
      const typeArray = Array.from(types);
      result[field] = {
        types: typeArray,
        primaryType: typeArray.length === 1 ? typeArray[0] : 'mixed'
      };
    }

    return result;
  }

  /**
   * Flattens nested object fields into dot notation
   */
  private flattenObjectFields(obj: any, prefix = ''): { [key: string]: string } {
    const flattened: { [key: string]: string } = {};

    for (const [key, value] of Object.entries(obj)) {
      const fieldPath = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        continue; // Skip arrays
      } else if (typeof value === 'object' && value !== null) {
        const nestedFields = this.flattenObjectFields(value, fieldPath);
        Object.assign(flattened, nestedFields);
      } else {
        flattened[fieldPath] = typeof value;
      }
    }

    return flattened;
  }

  /**
   * Gets only primitive fields (not nested objects or arrays)
   */
  private getPrimitiveFields(obj: any): { [key: string]: string } {
    const primitiveFields: { [key: string]: string } = {};

    for (const [key, value] of Object.entries(obj)) {
      if (!Array.isArray(value) && (typeof value !== 'object' || value === null)) {
        primitiveFields[key] = typeof value;
      }
    }

    return primitiveFields;
  }

  /**
   * Updates array sorting preference for a specific path
   */
  updateArraySortPreference(arrayPath: string, fieldName: string): void {
    this.arraySortPreferences[arrayPath] = fieldName;
    this.savePreferences();
    this.reProcessCurrentJson();
  }

  /**
   * Updates array nesting preference for a specific path
   */
  updateArrayNestingPreference(arrayPath: string, showNested: boolean): void {
    this.arrayNestingPreferences[arrayPath] = showNested;
    this.savePreferences();
    
    // Re-analyze arrays with new nesting preference
    this.reAnalyzeArrayFields();
    this.reProcessCurrentJson();
  }

  /**
   * Updates master nesting preference for all arrays
   */
  updateMasterNestingPreference(showNested: boolean): void {
    const currentFields = this.arrayFieldsSubject.value;
    for (const field of currentFields) {
      this.arrayNestingPreferences[field.fullPath] = showNested;
    }
    this.savePreferences();
    
    // Re-analyze arrays with new nesting preference
    this.reAnalyzeArrayFields();
    this.reProcessCurrentJson();
  }

  /**
   * Gets current sorting preferences
   */
  getSortingPreferences(): SortingOptions {
    return {
      sortKeys: true,
      sortArrays: true,
      arraySortPreferences: { ...this.arraySortPreferences },
      arrayNestingPreferences: { ...this.arrayNestingPreferences },
      arraySortOrderPreferences: { ...this.arraySortOrderPreferences },
      masterSortOrder: this.masterSortOrder
    };
  }

  /**
   * Saves preferences to localStorage
   */
  private savePreferences(): void {
    try {
      localStorage.setItem('json-checker.array-sort-preferences', JSON.stringify(this.arraySortPreferences));
      localStorage.setItem('json-checker.array-nesting-preferences', JSON.stringify(this.arrayNestingPreferences));
      localStorage.setItem('json-checker.array-sort-order-preferences', JSON.stringify(this.arraySortOrderPreferences));
      localStorage.setItem('json-checker.master-sort-order', this.masterSortOrder);
      localStorage.setItem('json-checker.field-sort-order', this.fieldSortOrder);
    } catch (error) {
      console.warn('Failed to save preferences to localStorage:', error);
    }
  }

  /**
   * Loads preferences from localStorage
   */
  private loadPreferences(): void {
    try {
      const sortPrefs = localStorage.getItem('json-checker.array-sort-preferences');
      const nestingPrefs = localStorage.getItem('json-checker.array-nesting-preferences');
      const sortOrderPrefs = localStorage.getItem('json-checker.array-sort-order-preferences');
      const masterSortOrder = localStorage.getItem('json-checker.master-sort-order');
      const fieldSortOrder = localStorage.getItem('json-checker.field-sort-order');

      if (sortPrefs) {
        this.arraySortPreferences = JSON.parse(sortPrefs);
      }
      if (nestingPrefs) {
        this.arrayNestingPreferences = JSON.parse(nestingPrefs);
      }
      if (sortOrderPrefs) {
        this.arraySortOrderPreferences = JSON.parse(sortOrderPrefs);
      }
      if (masterSortOrder) {
        this.masterSortOrder = masterSortOrder as 'asc' | 'desc';
      }
      if (fieldSortOrder) {
        this.fieldSortOrder = fieldSortOrder as 'asc' | 'desc';
      }
    } catch (error) {
      console.warn('Failed to load preferences from localStorage:', error);
    }
  }

  /**
   * Updates master sort order for all arrays
   */
  updateMasterSortOrder(sortOrder: 'asc' | 'desc'): void {
    this.masterSortOrder = sortOrder;
    const currentFields = this.arrayFieldsSubject.value;
    for (const field of currentFields) {
      this.arraySortOrderPreferences[field.fullPath] = sortOrder;
    }
    this.savePreferences();
    this.reProcessCurrentJson();
  }

  /**
   * Gets master sort order
   */
  getMasterSortOrder(): 'asc' | 'desc' {
    return this.masterSortOrder;
  }

  /**
   * Updates the field sort order (for object keys/fields)
   */
  updateFieldSortOrder(order: 'asc' | 'desc'): void {
    this.fieldSortOrder = order;
    this.savePreferences();
    
    // Re-process current JSON if available
    if (this.originalJsonData) {
      this.processJson(JSON.stringify(this.originalJsonData)).subscribe();
    }
  }

  /**
   * Gets the current field sort order
   */
  getFieldSortOrder(): 'asc' | 'desc' {
    return this.fieldSortOrder;
  }

  /**
   * Gets array sort order preference
   */
  getArraySortOrder(arrayPath: string): 'asc' | 'desc' {
    return this.arraySortOrderPreferences[arrayPath] || this.masterSortOrder;
  }

  /**
   * Updates array sort order preference for a specific path
   */
  updateArraySortOrder(arrayPath: string, sortOrder: 'asc' | 'desc'): void {
    this.arraySortOrderPreferences[arrayPath] = sortOrder;
    this.savePreferences();
    this.reProcessCurrentJson();
  }

  /**
   * Re-processes the current JSON with updated preferences
   */
  private reProcessCurrentJson(): void {
    if (this.originalJsonData) {
      const sortedJson = this.sortObjectKeys(this.originalJsonData);
      this.processedJsonSubject.next(sortedJson);
    }
  }

  /**
   * Re-analyzes array fields with current preferences
   */
  private reAnalyzeArrayFields(): void {
    if (this.originalJsonData) {
      const arrayFields = this.analyzeArrayFields(this.originalJsonData);
      this.arrayFieldsSubject.next(arrayFields);
    }
  }

  /**
   * Clears all preferences
   */
  clearPreferences(): void {
    this.arraySortPreferences = {};
    this.arrayNestingPreferences = {};
    this.arraySortOrderPreferences = {};
    this.masterSortOrder = 'asc';
    this.fieldSortOrder = 'asc';
    this.savePreferences();
  }
} 