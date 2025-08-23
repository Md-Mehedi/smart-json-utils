import { TestBed } from '@angular/core/testing';
import { JsonProcessorService } from './json-processor.service';
import { ArrayField } from '../shared/interfaces/json-data.interface';

describe('JsonProcessorService', () => {
  let service: JsonProcessorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonProcessorService);
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('JSON Validation and Analysis', () => {
    it('should validate valid JSON', () => {
      const validJson = '{"name": "test", "value": 123}';
      
      service.validateAndAnalyzeJson(validJson);
      
      service.validation$.subscribe(validation => {
        expect(validation.isValid).toBe(true);
        expect(validation.type).toBe('success');
      });
    });

    it('should invalidate malformed JSON', () => {
      const invalidJson = '{"name": "test", "value":}';
      
      service.validateAndAnalyzeJson(invalidJson);
      
      service.validation$.subscribe(validation => {
        expect(validation.isValid).toBe(false);
        expect(validation.type).toBe('error');
      });
    });

    it('should analyze arrays with fields', () => {
      const jsonWithArrays = JSON.stringify({
        users: [
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 }
        ],
        products: [
          { title: 'Product A', price: 100 },
          { title: 'Product B', price: 200 }
        ]
      });

      service.validateAndAnalyzeJson(jsonWithArrays);

      service.arrayFields$.subscribe(fields => {
        expect(fields.length).toBe(2);
        expect(fields.find(f => f.fullPath === 'users')).toBeTruthy();
        expect(fields.find(f => f.fullPath === 'products')).toBeTruthy();
      });
    });

    it('should analyze nested arrays', () => {
      const nestedJson = JSON.stringify({
        companies: [
          {
            name: 'TechCorp',
            employees: [
              { name: 'Alice', department: 'Engineering' },
              { name: 'Bob', department: 'Sales' }
            ]
          }
        ]
      });

      service.validateAndAnalyzeJson(nestedJson);

      service.arrayFields$.subscribe(fields => {
        expect(fields.length).toBe(2);
        expect(fields.find(f => f.fullPath === 'companies')).toBeTruthy();
        expect(fields.find(f => f.fullPath === 'companies.employees')).toBeTruthy();
      });
    });

    it('should analyze sparse arrays where first items are empty/incomplete', () => {
      const sparseArrayJson = JSON.stringify({
        name: [
          {
            items: []  // First item has empty items array
          },
          {
            items: [   // Second item has the actual structure
              {
                type: "string",
                value: "test"
              }
            ]
          }
        ]
      });

      service.validateAndAnalyzeJson(sparseArrayJson);

      service.arrayFields$.subscribe(fields => {
        // Should find: name, name.items, name.items.type
        expect(fields.length).toBe(2);
        
        const nameArray = fields.find(f => f.fullPath === 'name');
        expect(nameArray).toBeTruthy();
        expect(nameArray?.depth).toBe(0);
        
        const itemsArray = fields.find(f => f.fullPath === 'name.items');
        expect(itemsArray).toBeTruthy();
        expect(itemsArray?.depth).toBe(1);
        expect(itemsArray?.fields['type']).toBeTruthy();
        expect(itemsArray?.fields['value']).toBeTruthy();
      });
    });

    it('should handle multiple incomplete items before finding complete structure', () => {
      const multipleIncompleteJson = JSON.stringify({
        data: [
          { partial: "info" },      // First item - incomplete
          { },                      // Second item - empty object  
          { partial: "info2" },     // Third item - still incomplete
          {                         // Fourth item - complete structure
            partial: "info3",
            complete: {
              nested: [
                { field: "value", type: "string" }
              ]
            }
          }
        ]
      });

      service.validateAndAnalyzeJson(multipleIncompleteJson);

      service.arrayFields$.subscribe(fields => {
        expect(fields.length).toBe(2);
        
        const dataArray = fields.find(f => f.fullPath === 'data');
        expect(dataArray).toBeTruthy();
        
        const nestedArray = fields.find(f => f.fullPath === 'data.complete.nested');
        expect(nestedArray).toBeTruthy();
        expect(nestedArray?.fields['field']).toBeTruthy();
        expect(nestedArray?.fields['type']).toBeTruthy();
      });
    });

    it('should keep most complete field information when merging discoveries', () => {
      const varyingComplexityJson = JSON.stringify({
        items: [
          {
            subItems: [
              { basicField: "value1" }  // Less complete
            ]
          },
          {
            subItems: [
              { 
                basicField: "value2",
                extraField: "extra",     // More complete structure
                anotherField: 123
              }
            ]
          },
          {
            subItems: [
              { basicField: "value3" }  // Back to less complete
            ]
          }
        ]
      });

      service.validateAndAnalyzeJson(varyingComplexityJson);

      service.arrayFields$.subscribe(fields => {
        const subItemsArray = fields.find(f => f.fullPath === 'items.subItems');
        expect(subItemsArray).toBeTruthy();
        
        // Should have all fields from the most complete item
        expect(subItemsArray?.fields['basicField']).toBeTruthy();
        expect(subItemsArray?.fields['extraField']).toBeTruthy();
        expect(subItemsArray?.fields['anotherField']).toBeTruthy();
      });
    });

    it('should handle deeply nested sparse arrays', () => {
      const deeplyNestedSparseJson = JSON.stringify({
        level1: [
          {
            level2: [
              { level3: [] }  // Empty at level 3
            ]
          },
          {
            level2: [
              {
                level3: [
                  { finalField: "found it!", type: "success" }
                ]
              }
            ]
          }
        ]
      });

      service.validateAndAnalyzeJson(deeplyNestedSparseJson);

      service.arrayFields$.subscribe(fields => {
        expect(fields.length).toBe(3);
        
        const level1 = fields.find(f => f.fullPath === 'level1');
        const level2 = fields.find(f => f.fullPath === 'level1.level2');
        const level3 = fields.find(f => f.fullPath === 'level1.level2.level3');
        
        expect(level1).toBeTruthy();
        expect(level2).toBeTruthy();
        expect(level3).toBeTruthy();
        
        // Level 3 should have discovered the fields from the second path
        expect(level3?.fields['finalField']).toBeTruthy();
        expect(level3?.fields['type']).toBeTruthy();
      });
    });
  });

  describe('Array Sorting Preferences', () => {
    it('should set and get array sort preferences', () => {
      service.updateArraySortPreference('users', 'name');
      
      const preferences = service.getSortingPreferences();
      expect(preferences.arraySortPreferences['users']).toBe('name');
    });

    it('should set and get array sort order preferences', () => {
      service.updateArraySortOrder('users', 'desc');
      
      expect(service.getArraySortOrder('users')).toBe('desc');
    });

    it('should update master sort order for all arrays', () => {
      // First set up some arrays
      const jsonWithArrays = JSON.stringify({
        users: [{ name: 'Alice' }],
        products: [{ title: 'Product A' }]
      });
      service.validateAndAnalyzeJson(jsonWithArrays);

      service.updateMasterSortOrder('desc');

      expect(service.getMasterSortOrder()).toBe('desc');
      expect(service.getArraySortOrder('users')).toBe('desc');
      expect(service.getArraySortOrder('products')).toBe('desc');
    });

    it('should fall back to master sort order when no specific preference is set', () => {
      service.updateMasterSortOrder('desc');
      
      expect(service.getArraySortOrder('nonexistent')).toBe('desc');
    });
  });

  describe('JSON Processing and Sorting', () => {
    it('should process and sort simple JSON', (done) => {
      const jsonString = JSON.stringify({
        users: [
          { name: 'Charlie', age: 35 },
          { name: 'Alice', age: 30 },
          { name: 'Bob', age: 25 }
        ]
      });

      // Set sorting preferences
      service.updateArraySortPreference('users', 'name');
      service.updateArraySortOrder('users', 'asc');

      service.processJson(jsonString).subscribe(result => {
        expect(result.users[0].name).toBe('Alice');
        expect(result.users[1].name).toBe('Bob');
        expect(result.users[2].name).toBe('Charlie');
        done();
      });
    });

    it('should sort arrays in descending order', () => {
      const jsonString = JSON.stringify({
        products: [
          { title: 'Product A', price: 100 },
          { title: 'Product C', price: 300 },
          { title: 'Product B', price: 200 }
        ]
      });

      service.updateArraySortPreference('products', 'price');
      service.updateArraySortOrder('products', 'desc');

      service.processJson(jsonString).subscribe(result => {
        expect(result.products[0].price).toBe(300);
        expect(result.products[1].price).toBe(200);
        expect(result.products[2].price).toBe(100);
      });
    });

    it('should sort nested arrays correctly', (done) => {
      const jsonString = JSON.stringify({
        companies: [
          {
            name: 'TechCorp',
            employees: [
              { name: 'Charlie', department: 'Engineering' },
              { name: 'Alice', department: 'Sales' },
              { name: 'Bob', department: 'Marketing' }
            ]
          }
        ]
      });

      service.updateArraySortPreference('companies.employees', 'name');
      service.updateArraySortOrder('companies.employees', 'asc');

      service.processJson(jsonString).subscribe(result => {
        const employees = result.companies[0].employees;
        expect(employees[0].name).toBe('Alice');
        expect(employees[1].name).toBe('Bob');
        expect(employees[2].name).toBe('Charlie');
        done();
      });
    });

    it('should handle arrays with null/undefined values', () => {
      const jsonString = JSON.stringify({
        users: [
          { name: 'Alice', age: 30 },
          { name: null, age: 25 },
          { name: 'Bob', age: null }
        ]
      });

      service.updateArraySortPreference('users', 'name');
      service.updateArraySortOrder('users', 'asc');

      service.processJson(jsonString).subscribe(result => {
        // Null values should be sorted to the end in ascending order
        expect(result.users[0].name).toBe('Alice');
        expect(result.users[1].name).toBe('Bob');
        expect(result.users[2].name).toBe(null);
      });
    });

    it('should handle mixed data types in sorting', (done) => {
      const jsonString = JSON.stringify({
        items: [
          { value: 'zebra' },
          { value: 123 },
          { value: 'apple' },
          { value: 456 }
        ]
      });

      service.updateArraySortPreference('items', 'value');
      service.updateArraySortOrder('items', 'asc');

      service.processJson(jsonString).subscribe(result => {
        // Should convert to strings and sort: "123", "456", "apple", "zebra"
        expect(result.items).toBeDefined();
        expect(result.items.length).toBe(4);
        expect(result.items[0].value).toBe(123);      // "123" comes first
        expect(result.items[1].value).toBe(456);      // "456" comes second  
        expect(result.items[2].value).toBe('apple');  // "apple" comes third
        expect(result.items[3].value).toBe('zebra');  // "zebra" comes last
        done();
      });
    });

    it('should not sort arrays without preferences set', (done) => {
      const jsonString = JSON.stringify({
        users: [
          { name: 'Charlie' },
          { name: 'Alice' },
          { name: 'Bob' }
        ]
      });

      // CRITICAL: Clear any existing preferences to ensure clean test
      service.clearPreferences();

      service.processJson(jsonString).subscribe(result => {
        // Should maintain original order when no sort preference is set
        expect(result.users[0].name).toBe('Charlie');
        expect(result.users[1].name).toBe('Alice');
        expect(result.users[2].name).toBe('Bob');
        done();
      });
    });

    it('should use cascading sort when primary field values are equal', (done) => {
      const jsonString = JSON.stringify({
        users: [
          { status: 'active', name: 'Charlie', age: 30 },
          { status: 'active', name: 'Alice', age: 25 },
          { status: 'active', name: 'Bob', age: 35 },
          { status: 'inactive', name: 'David', age: 28 }
        ]
      });

      service.updateArraySortPreference('users', 'status');
      service.updateArraySortOrder('users', 'asc');

      service.processJson(jsonString).subscribe(result => {
        // Primary sort by status: 'active' items first, then 'inactive'
        // Within 'active' status, should use cascading sort (alphabetically: age, name)
        // Age comes before name alphabetically, so secondary sort by age
        expect(result.users[0].status).toBe('active');
        expect(result.users[0].age).toBe(25); // Alice - lowest age among active users
        expect(result.users[1].status).toBe('active');
        expect(result.users[1].age).toBe(30); // Charlie - middle age
        expect(result.users[2].status).toBe('active');
        expect(result.users[2].age).toBe(35); // Bob - highest age
        expect(result.users[3].status).toBe('inactive');
        expect(result.users[3].name).toBe('David'); // David - only inactive user
        done();
      });
    });

    it('should use multiple levels of cascading sort', (done) => {
      const jsonString = JSON.stringify({
        products: [
          { category: 'electronics', price: 100, name: 'Tablet', brand: 'Samsung' },
          { category: 'electronics', price: 100, name: 'Phone', brand: 'Apple' },
          { category: 'electronics', price: 100, name: 'Phone', brand: 'Samsung' },
          { category: 'books', price: 50, name: 'Novel', brand: 'Publisher A' }
        ]
      });

      service.updateArraySortPreference('products', 'category');
      service.updateArraySortOrder('products', 'asc');

      service.processJson(jsonString).subscribe(result => {
        // Primary: category (books before electronics)
        // Secondary: brand (alphabetically first tiebreaker)
        // Tertiary: name (if brand is same)
        // Quaternary: price (if all above are same)
        
        expect(result.products[0].category).toBe('books');
        expect(result.products[0].name).toBe('Novel');
        
        // Electronics items sorted by cascading: brand -> name -> price
        expect(result.products[1].category).toBe('electronics');
        expect(result.products[1].brand).toBe('Apple'); // Apple comes before Samsung
        expect(result.products[1].name).toBe('Phone');
        
        expect(result.products[2].category).toBe('electronics');
        expect(result.products[2].brand).toBe('Samsung');
        expect(result.products[2].name).toBe('Phone'); // Phone before Tablet
        
        expect(result.products[3].category).toBe('electronics');
        expect(result.products[3].brand).toBe('Samsung');
        expect(result.products[3].name).toBe('Tablet');
        
        done();
      });
    });

    it('should handle nested fields in cascading sort', (done) => {
      const jsonString = JSON.stringify({
        employees: [
          { department: 'IT', info: { name: 'Alice', experience: 5 }, salary: 70000 },
          { department: 'IT', info: { name: 'Bob', experience: 3 }, salary: 65000 },
          { department: 'IT', info: { name: 'Alice', experience: 3 }, salary: 60000 },
          { department: 'HR', info: { name: 'Carol', experience: 7 }, salary: 75000 }
        ]
      });

      service.updateArraySortPreference('employees', 'department');
      service.updateArraySortOrder('employees', 'asc');

      service.processJson(jsonString).subscribe(result => {
        // Primary: department (HR before IT)
        expect(result.employees[0].department).toBe('HR');
        expect(result.employees[0].info.name).toBe('Carol');
        
        // IT department sorted by cascading fields: info.experience, info.name, salary
        expect(result.employees[1].department).toBe('IT');
        expect(result.employees[1].info.experience).toBe(3); // Lower experience first
        expect(result.employees[1].info.name).toBe('Alice'); // Alice before Bob alphabetically
        
        expect(result.employees[2].department).toBe('IT');
        expect(result.employees[2].info.experience).toBe(3);
        expect(result.employees[2].info.name).toBe('Bob');
        
        expect(result.employees[3].department).toBe('IT');
        expect(result.employees[3].info.experience).toBe(5);
        expect(result.employees[3].info.name).toBe('Alice');
        
        done();
      });
    });

    it('should respect sort order in cascading sort', (done) => {
      const jsonString = JSON.stringify({
        items: [
          { priority: 'high', name: 'Task C', order: 3 },
          { priority: 'high', name: 'Task A', order: 1 },
          { priority: 'high', name: 'Task B', order: 2 },
          { priority: 'low', name: 'Task D', order: 4 }
        ]
      });

      service.updateArraySortPreference('items', 'priority');
      service.updateArraySortOrder('items', 'desc'); // Descending order

      service.processJson(jsonString).subscribe(result => {
        // Primary: priority desc (alphabetically: 'low' before 'high' in desc order)
        // Secondary: name asc (alphabetical - first available field for cascading)
        expect(result.items[0].priority).toBe('low');
        expect(result.items[0].name).toBe('Task D'); // Only low priority item
        
        expect(result.items[1].priority).toBe('high');
        expect(result.items[1].name).toBe('Task A'); // First alphabetically among high items
        
        expect(result.items[2].priority).toBe('high');
        expect(result.items[2].name).toBe('Task B');
        
        expect(result.items[3].priority).toBe('high');
        expect(result.items[3].name).toBe('Task C');
        
        done();
      });
    });
  });

  describe('Nested Field Handling', () => {
    it('should sort by nested field paths', () => {
      const jsonString = JSON.stringify({
        users: [
          { profile: { details: { score: 85 } } },
          { profile: { details: { score: 95 } } },
          { profile: { details: { score: 75 } } }
        ]
      });

      service.updateArraySortPreference('users', 'profile.details.score');
      service.updateArraySortOrder('users', 'asc');

      service.processJson(jsonString).subscribe(result => {
        expect(result.users[0].profile.details.score).toBe(75);
        expect(result.users[1].profile.details.score).toBe(85);
        expect(result.users[2].profile.details.score).toBe(95);
      });
    });
  });

  describe('Preference Persistence', () => {
    it('should save preferences to localStorage', () => {
      service.updateArraySortPreference('users', 'name');
      service.updateArraySortOrder('users', 'desc');

      expect(localStorage.getItem('json-checker.array-sort-preferences')).toBeTruthy();
      expect(localStorage.getItem('json-checker.array-sort-order-preferences')).toBeTruthy();
    });

    it('should load preferences from localStorage', () => {
      // Pre-populate localStorage
      localStorage.setItem('json-checker.array-sort-preferences', JSON.stringify({ 'users': 'name' }));
      localStorage.setItem('json-checker.array-sort-order-preferences', JSON.stringify({ 'users': 'desc' }));
      localStorage.setItem('json-checker.master-sort-order', 'desc');

      // Create new service instance to test loading
      const newService = new JsonProcessorService();

      const preferences = newService.getSortingPreferences();
      expect(preferences.arraySortPreferences['users']).toBe('name');
      expect(newService.getArraySortOrder('users')).toBe('desc');
      expect(newService.getMasterSortOrder()).toBe('desc');
    });

    it('should clear all preferences', () => {
      service.updateArraySortPreference('users', 'name');
      service.updateArraySortOrder('users', 'desc');

      service.clearPreferences();

      const preferences = service.getSortingPreferences();
      expect(Object.keys(preferences.arraySortPreferences).length).toBe(0);
      expect(Object.keys(preferences.arraySortOrderPreferences || {}).length).toBe(0);
      expect(service.getMasterSortOrder()).toBe('asc');
    });
  });

  describe('Path Normalization', () => {
    it('should handle array indices in paths correctly', () => {
      const jsonString = JSON.stringify({
        companies: [
          {
            departments: [
              { name: 'Engineering', employees: [{ name: 'Charlie' }, { name: 'Alice' }] },
              { name: 'Sales', employees: [{ name: 'Bob' }, { name: 'Diana' }] }
            ]
          }
        ]
      });

      // Set preference for deeply nested array
      service.updateArraySortPreference('companies.departments.employees', 'name');
      service.updateArraySortOrder('companies.departments.employees', 'asc');

      service.processJson(jsonString).subscribe(result => {
        // Check that all nested employee arrays are sorted
        const dept1Employees = result.companies[0].departments[0].employees;
        const dept2Employees = result.companies[0].departments[1].employees;
        
        expect(dept1Employees[0].name).toBe('Alice');
        expect(dept1Employees[1].name).toBe('Charlie');
        expect(dept2Employees[0].name).toBe('Bob');
        expect(dept2Employees[1].name).toBe('Diana');
      });
    });
  });

  describe('Critical Sorting Verification', () => {
    it('should ACTUALLY sort when preferences are set vs NOT sort when preferences are missing', () => {
      const testData = {
        users: [
          { name: 'Zebra', score: 10 },
          { name: 'Alpha', score: 30 },
          { name: 'Beta', score: 20 }
        ]
      };

      // STEP 1: Test WITHOUT preferences - should maintain original order
      service.clearPreferences();
      
      const resultWithoutPrefs = service['sortObjectKeys'](testData);
      // Should be in original order: Zebra, Alpha, Beta
      expect(resultWithoutPrefs.users[0].name).toBe('Zebra');
      expect(resultWithoutPrefs.users[1].name).toBe('Alpha');
      expect(resultWithoutPrefs.users[2].name).toBe('Beta');

      // STEP 2: Now set preferences and test WITH sorting
      service.updateArraySortPreference('users', 'name');
      service.updateArraySortOrder('users', 'asc');

      const resultWithPrefs = service['sortObjectKeys'](testData);
      // Should be sorted: Alpha, Beta, Zebra
      expect(resultWithPrefs.users[0].name).toBe('Alpha');
      expect(resultWithPrefs.users[1].name).toBe('Beta');
      expect(resultWithPrefs.users[2].name).toBe('Zebra');
      
      // STEP 3: Test DESC order
      service.updateArraySortOrder('users', 'desc');
      
      const resultDesc = service['sortObjectKeys'](testData);
      // Should be reverse sorted: Zebra, Beta, Alpha
      expect(resultDesc.users[0].name).toBe('Zebra');
      expect(resultDesc.users[1].name).toBe('Beta');
      expect(resultDesc.users[2].name).toBe('Alpha');
    });

    it('should handle null values correctly in sorting', () => {
      const testData = {
        items: [
          { value: 'Charlie' },
          { value: null },
          { value: 'Alice' },
          { value: undefined },
          { value: 'Bob' }
        ]
      };

      service.updateArraySortPreference('items', 'value');
      service.updateArraySortOrder('items', 'asc');

      const result = service['sortObjectKeys'](testData);
      // Non-null values should be sorted first, nulls at the end
      expect(result.items[0].value).toBe('Alice');
      expect(result.items[1].value).toBe('Bob');
      expect(result.items[2].value).toBe('Charlie');
      // Null values should be at the end
      expect(result.items[3].value).toBeNull();
    });
  });
}); 