import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SchemaGeneratorService {
  private minifiedDataSubject = new BehaviorSubject<any>(null);
  public minifiedData$ = this.minifiedDataSubject.asObservable();

  constructor() { }

  /**
   * Generate a minified JSON structure showing one example of each array item
   */
  generateMinifiedStructure(jsonData: any): any {
    if (jsonData === null || jsonData === undefined) {
      this.minifiedDataSubject.next(null);
      return null;
    }

    const minified = this.minifyData(jsonData);
    this.minifiedDataSubject.next(minified);
    return minified;
  }

  /**
   * Recursively minify JSON data
   */
  private minifyData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (Array.isArray(data)) {
      // For arrays, return only the first item (minified)
      if (data.length === 0) {
        return [];
      }
      
      // Find the most complete item (the one with most properties if objects)
      const mostCompleteItem = this.findMostCompleteItem(data);
      return [this.minifyData(mostCompleteItem)];
    }

    if (typeof data === 'object') {
      const minified: any = {};
      
      // Process all properties
      for (const [key, value] of Object.entries(data)) {
        minified[key] = this.minifyData(value);
      }
      
      return minified;
    }

    // For primitive types, return a representative value with type info
    return this.getRepresentativeValue(data);
  }

  /**
   * Find the most complete item in an array (for better representation)
   */
  private findMostCompleteItem(array: any[]): any {
    if (array.length === 0) return null;
    if (array.length === 1) return array[0];

    // For objects, find the one with most properties
    const objectItems = array.filter(item => typeof item === 'object' && item !== null && !Array.isArray(item));
    
    if (objectItems.length > 0) {
      return objectItems.reduce((prev, current) => {
        const prevKeys = Object.keys(prev).length;
        const currentKeys = Object.keys(current).length;
        return currentKeys > prevKeys ? current : prev;
      });
    }

    // For non-objects, return the first item
    return array[0];
  }

  /**
   * Get a representative value that shows the type
   */
  private getRepresentativeValue(value: any): any {
    const type = typeof value;
    
    switch (type) {
      case 'string':
        // Keep original string if it's short and meaningful, otherwise use "string"
        if (value.length <= 20 && /^[a-zA-Z0-9_-]+$/.test(value)) {
          return value;
        }
        return "string";
        
      case 'number':
        // Use 0 for integers, 0.0 for decimals
        return Number.isInteger(value) ? 0 : 0.0;
        
      case 'boolean':
        return true;
        
      case 'object':
        if (value === null) return null;
        break;
        
      default:
        return value;
    }
    
    return value;
  }

  /**
   * Clear the current minified data
   */
  clearMinifiedData(): void {
    this.minifiedDataSubject.next(null);
  }

  /**
   * Get the current minified data as a formatted JSON string
   */
  getFormattedMinifiedData(): string {
    const current = this.minifiedDataSubject.value;
    if (!current) return '';
    
    return JSON.stringify(current, null, 2);
  }

  // Backward compatibility - keeping schema$ observable name
  get schema$() {
    return this.minifiedData$;
  }

  // Backward compatibility methods
  generateSchema(jsonData: any): any {
    return this.generateMinifiedStructure(jsonData);
  }

  clearSchema(): void {
    this.clearMinifiedData();
  }

  getFormattedSchema(): string {
    return this.getFormattedMinifiedData();
  }
} 