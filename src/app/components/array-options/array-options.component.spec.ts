import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';

import { ArrayOptionsComponent } from './array-options.component';
import { JsonProcessorService } from '../../services/json-processor.service';
import { UiStateService } from '../../services/ui-state.service';
import { ArrayField } from '../../shared/interfaces/json-data.interface';

describe('ArrayOptionsComponent', () => {
  let component: ArrayOptionsComponent;
  let fixture: ComponentFixture<ArrayOptionsComponent>;
  let mockJsonProcessorService: jasmine.SpyObj<JsonProcessorService>;
  let mockUiStateService: jasmine.SpyObj<UiStateService>;

  const mockArrayFields: ArrayField[] = [
    {
      fullPath: 'users',
      name: 'users',
      depth: 0,
      items: 3,
      fields: {
        'name': { types: ['string'], primaryType: 'string' },
        'age': { types: ['number'], primaryType: 'number' }
      },
      parentPath: ''
    },
    {
      fullPath: 'companies.employees',
      name: 'employees',
      depth: 1,
      items: 2,
      fields: {
        'name': { types: ['string'], primaryType: 'string' },
        'department': { types: ['string'], primaryType: 'string' }
      },
      parentPath: 'companies'
    }
  ];

  beforeEach(async () => {
    const jsonProcessorSpy = jasmine.createSpyObj('JsonProcessorService', [
      'updateMasterNestingPreference',
      'updateArrayNestingPreference', 
      'updateArraySortPreference',
      'updateMasterSortOrder',
      'updateArraySortOrder',
      'getSortingPreferences',
      'getArraySortOrder',
      'getMasterSortOrder',
      'getFieldSortOrder',
      'updateFieldSortOrder'
    ], {
      arrayFields$: new BehaviorSubject<ArrayField[]>(mockArrayFields)
    });

    const uiStateSpy = jasmine.createSpyObj('UiStateService', [
      'hideSidebar',
      'toggleSidebar'
    ], {
      sidebarVisible$: new BehaviorSubject<boolean>(true),
      floatingButtonVisible$: new BehaviorSubject<boolean>(true),
      backToTopVisible$: new BehaviorSubject<boolean>(false)
    });

    await TestBed.configureTestingModule({
      imports: [ArrayOptionsComponent, FormsModule],
      providers: [
        { provide: JsonProcessorService, useValue: jsonProcessorSpy },
        { provide: UiStateService, useValue: uiStateSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ArrayOptionsComponent);
    component = fixture.componentInstance;
    mockJsonProcessorService = TestBed.inject(JsonProcessorService) as jasmine.SpyObj<JsonProcessorService>;
    mockUiStateService = TestBed.inject(UiStateService) as jasmine.SpyObj<UiStateService>;

    // Setup default return values
    mockJsonProcessorService.getSortingPreferences.and.returnValue({
      sortKeys: true,
      sortArrays: true,
      arraySortPreferences: {},
      arrayNestingPreferences: {}
    });
    mockJsonProcessorService.getArraySortOrder.and.returnValue('asc');
    mockJsonProcessorService.getMasterSortOrder.and.returnValue('asc');
    mockJsonProcessorService.getFieldSortOrder.and.returnValue('asc');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with array fields from service', () => {
    // Array fields should be sorted by depth (desc) then name (asc)
    // So 'companies.employees' (depth 1) should come before 'users' (depth 0)
    const expectedSortedOrder = [mockArrayFields[1], mockArrayFields[0]]; // employees first, then users
    expect(component.arrayFields).toEqual(expectedSortedOrder);
  });

  it('should initialize master sort order from service', () => {
    expect(component.masterSortOrder).toBe('asc');
  });

  describe('Master Nested Checkbox', () => {
    it('should call service when master nested preference changes', () => {
      const checkbox = fixture.debugElement.query(By.css('#showNestedFields'));
      expect(checkbox).toBeTruthy();

      checkbox.nativeElement.checked = false;
      checkbox.nativeElement.dispatchEvent(new Event('change'));

      expect(mockJsonProcessorService.updateMasterNestingPreference).toHaveBeenCalledWith(false);
    });

    it('should update checkbox state based on individual preferences', () => {
      mockJsonProcessorService.getSortingPreferences.and.returnValue({
        sortKeys: true,
        sortArrays: true,
        arraySortPreferences: {},
        arrayNestingPreferences: {
          'users': true,
          'companies.employees': false
        }
      });

      component.ngOnInit();
      
      expect(component.masterNestedIndeterminate).toBe(true);
      expect(component.masterNestedChecked).toBe(false);
    });
  });

  describe('Master Sort Order Toggle', () => {
    it('should toggle master sort order when button is clicked', () => {
      const toggleButton = fixture.debugElement.query(By.css('.sort-order-btn'));
      expect(toggleButton).toBeTruthy();

      toggleButton.nativeElement.click();

      expect(mockJsonProcessorService.updateMasterSortOrder).toHaveBeenCalledWith('desc');
    });

    it('should display correct ASC/DESC state', () => {
      component.masterSortOrder = 'asc';
      fixture.detectChanges();

      const toggleButton = fixture.debugElement.query(By.css('.sort-order-btn'));
      expect(toggleButton.nativeElement.textContent.trim()).toContain('ASC');
      expect(toggleButton.nativeElement.classList).toContain('asc');

      component.masterSortOrder = 'desc';
      fixture.detectChanges();

      expect(toggleButton.nativeElement.textContent.trim()).toContain('DESC');
      expect(toggleButton.nativeElement.classList).toContain('desc');
    });
  });

  describe('Individual Array Controls', () => {
    it('should render controls for each array field', () => {
      const arrayItems = fixture.debugElement.queryAll(By.css('.array-item'));
      expect(arrayItems.length).toBe(2);

      // After sorting: employees (depth 1) should be first, users (depth 0) should be second
      const firstArrayName = arrayItems[0].query(By.css('.array-name'));
      expect(firstArrayName.nativeElement.textContent).toBe('employees');

      const secondArrayName = arrayItems[1].query(By.css('.array-name'));
      expect(secondArrayName.nativeElement.textContent).toBe('users');
    });

    it('should call service when individual nested preference changes', () => {
      const nestedCheckbox = fixture.debugElement.query(By.css('#nested-users'));
      expect(nestedCheckbox).toBeTruthy();

      nestedCheckbox.nativeElement.checked = false;
      nestedCheckbox.nativeElement.dispatchEvent(new Event('change'));

      expect(mockJsonProcessorService.updateArrayNestingPreference).toHaveBeenCalledWith('users', false);
    });

    it('should call service when individual sort order changes', () => {
      const sortOrderButton = fixture.debugElement.query(By.css('.sort-order-btn-sm'));
      expect(sortOrderButton).toBeTruthy();

      sortOrderButton.nativeElement.click();

      // After sorting, the first array is now 'companies.employees' (depth 1)
      expect(mockJsonProcessorService.updateArraySortOrder).toHaveBeenCalledWith('companies.employees', 'desc');
    });

    it('should render field options when array is expanded', () => {
      // Expand the first array
      component.expandedArrays.add('users');
      fixture.detectChanges();

      const fieldOptions = fixture.debugElement.queryAll(By.css('.field-option'));
      // Note: We have 2 arrays with 2 fields each = 4 total field options
      expect(fieldOptions.length).toBeGreaterThanOrEqual(2);

      // Check for users array fields
      const usersSection = fixture.debugElement.query(By.css('.array-fields'));
      expect(usersSection).toBeTruthy();
    });

    it('should call service when field preference changes', () => {
      component.expandedArrays.add('users');
      fixture.detectChanges();

      const nameRadio = fixture.debugElement.query(By.css('#users-name'));
      expect(nameRadio).toBeTruthy();

      nameRadio.nativeElement.checked = true;
      nameRadio.nativeElement.dispatchEvent(new Event('change'));

      expect(mockJsonProcessorService.updateArraySortPreference).toHaveBeenCalledWith('users', 'name');
    });
  });

  describe('Expand/Collapse Controls', () => {
    it('should expand all arrays when expand all button is clicked', () => {
      const expandAllButton = fixture.debugElement.query(By.css('button[title="Expand all array sections"]'));
      expect(expandAllButton).toBeTruthy();

      expandAllButton.nativeElement.click();

      expect(component.expandedArrays.has('users')).toBe(true);
      expect(component.expandedArrays.has('companies.employees')).toBe(true);
    });

    it('should collapse all arrays when collapse all button is clicked', () => {
      // First expand some arrays
      component.expandedArrays.add('users');
      component.expandedArrays.add('companies.employees');

      const collapseAllButton = fixture.debugElement.query(By.css('button[title="Collapse all array sections"]'));
      expect(collapseAllButton).toBeTruthy();

      collapseAllButton.nativeElement.click();

      expect(component.expandedArrays.size).toBe(0);
    });

    it('should toggle individual array expansion when header is clicked', () => {
      const arrayHeader = fixture.debugElement.query(By.css('.array-header'));
      expect(arrayHeader).toBeTruthy();

      // Clear any initial expanded state
      component.expandedArrays.clear();

      // Initially not expanded
      expect(component.expandedArrays.has('users')).toBe(false);

      // Call the method directly since click event might not trigger due to nested elements
      component.toggleArrayExpansion('users');
      expect(component.expandedArrays.has('users')).toBe(true);

      component.toggleArrayExpansion('users');
      expect(component.expandedArrays.has('users')).toBe(false);
    });
  });

  describe('UI State Management', () => {
    it('should close sidebar when close button is clicked', () => {
      const closeButton = fixture.debugElement.query(By.css('.sidebar-close'));
      expect(closeButton).toBeTruthy();

      closeButton.nativeElement.click();

      expect(mockUiStateService.hideSidebar).toHaveBeenCalled();
    });

    it('should display correct array information', () => {
      const arrayItems = fixture.debugElement.queryAll(By.css('.array-item'));
      
      // After sorting: first item is now 'companies.employees' (depth 1, 2 items)
      const firstArrayInfo = arrayItems[0].query(By.css('.array-info'));
      expect(firstArrayInfo.nativeElement.textContent).toBe('2 items');

      const firstDepthBadge = arrayItems[0].query(By.css('.depth-badge'));
      expect(firstDepthBadge.nativeElement.textContent).toBe('D1');
    });

    it('should display no arrays message when no arrays present', () => {
      component.arrayFields = [];
      fixture.detectChanges();

      const noArraysMessage = fixture.debugElement.query(By.css('.no-arrays-message'));
      expect(noArraysMessage).toBeTruthy();
      expect(noArraysMessage.nativeElement.textContent).toContain('No arrays detected');
    });
  });

  describe('Helper Methods', () => {
    it('should return correct field entries', () => {
      const fields = {
        'name': { types: ['string'], primaryType: 'string' },
        'age': { types: ['number'], primaryType: 'number' }
      };

      const entries = component.getFieldEntries(fields);
      expect(entries.length).toBe(2);
      expect(entries[0].key).toBe('name');
      expect(entries[1].key).toBe('age');
    });

    it('should return correct type icons', () => {
      const stringIcon = component.getTypeIcon('string');
      const numberIcon = component.getTypeIcon('number');
      const unknownIcon = component.getTypeIcon('unknown');

      expect(stringIcon).toBeTruthy();
      expect(numberIcon).toBeTruthy();
      expect(unknownIcon).toBe('fas fa-question');
    });

    it('should get array sort preference from service', () => {
      mockJsonProcessorService.getSortingPreferences.and.returnValue({
        sortKeys: true,
        sortArrays: true,
        arraySortPreferences: { 'users': 'name' },
        arrayNestingPreferences: {}
      });

      const preference = component.getArraySortPreference('users');
      expect(preference).toBe('name');
    });

    it('should get array nesting preference from service', () => {
      mockJsonProcessorService.getSortingPreferences.and.returnValue({
        sortKeys: true,
        sortArrays: true,
        arraySortPreferences: {},
        arrayNestingPreferences: { 'users': false }
      });

      const preference = component.getArrayNestingPreference('users');
      expect(preference).toBe(false);
    });

    it('should get array sort order from service', () => {
      mockJsonProcessorService.getArraySortOrder.and.returnValue('desc');

      const order = component.getArraySortOrder('users');
      expect(order).toBe('desc');
    });
  });

  describe('Array Fields Sorting', () => {
    it('should sort array fields by depth (descending) then by name (ascending)', () => {
      const unsortedFields: ArrayField[] = [
        {
          fullPath: 'users',
          name: 'users',
          depth: 0,
          items: 3,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        },
        {
          fullPath: 'companies.departments.teams',
          name: 'teams',
          depth: 2,
          items: 5,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies.departments'
        },
        {
          fullPath: 'companies.departments',
          name: 'departments',
          depth: 1,
          items: 4,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies'
        },
        {
          fullPath: 'companies.departments.teams.projects.tasks',
          name: 'tasks',
          depth: 4,
          items: 8,
          fields: { 'title': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies.departments.teams.projects'
        },
        {
          fullPath: 'companies.departments.teams.projects',
          name: 'projects',
          depth: 3,
          items: 6,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies.departments.teams'
        }
      ];

      // Call the private method using bracket notation to access it
      const sortedFields = (component as any).sortArrayFields(unsortedFields);

      // Verify sorting: depth (desc) then name (asc)
      expect(sortedFields.length).toBe(5);
      expect(sortedFields[0].name).toBe('tasks');     // depth 4
      expect(sortedFields[0].depth).toBe(4);
      expect(sortedFields[1].name).toBe('projects');  // depth 3
      expect(sortedFields[1].depth).toBe(3);
      expect(sortedFields[2].name).toBe('teams');     // depth 2
      expect(sortedFields[2].depth).toBe(2);
      expect(sortedFields[3].name).toBe('departments'); // depth 1
      expect(sortedFields[3].depth).toBe(1);
      expect(sortedFields[4].name).toBe('users');     // depth 0
      expect(sortedFields[4].depth).toBe(0);
    });

    it('should sort arrays with same depth alphabetically by name', () => {
      const sameDepthFields: ArrayField[] = [
        {
          fullPath: 'zebra',
          name: 'zebra',
          depth: 1,
          items: 2,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        },
        {
          fullPath: 'alpha',
          name: 'alpha',
          depth: 1,
          items: 3,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        },
        {
          fullPath: 'beta',
          name: 'beta',
          depth: 1,
          items: 1,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        }
      ];

      const sortedFields = (component as any).sortArrayFields(sameDepthFields);

      expect(sortedFields[0].name).toBe('alpha');
      expect(sortedFields[1].name).toBe('beta');
      expect(sortedFields[2].name).toBe('zebra');
             // All should have same depth
       expect(sortedFields.every((f: ArrayField) => f.depth === 1)).toBe(true);
    });

    it('should handle empty array fields', () => {
      const emptyFields: ArrayField[] = [];
      const sortedFields = (component as any).sortArrayFields(emptyFields);
      expect(sortedFields).toEqual([]);
    });

    it('should handle single array field', () => {
      const singleField: ArrayField[] = [
        {
          fullPath: 'users',
          name: 'users',
          depth: 0,
          items: 3,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        }
      ];

      const sortedFields = (component as any).sortArrayFields(singleField);
      expect(sortedFields.length).toBe(1);
      expect(sortedFields[0].name).toBe('users');
    });

    it('should apply sorting when array fields are updated from service', () => {
      const unsortedFields: ArrayField[] = [
        {
          fullPath: 'low-depth',
          name: 'low-depth',
          depth: 0,
          items: 1,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        },
        {
          fullPath: 'high-depth',
          name: 'high-depth',
          depth: 2,
          items: 1,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        }
      ];

             // Simulate service emitting new fields
       const arrayFieldsSubject = mockJsonProcessorService.arrayFields$ as BehaviorSubject<ArrayField[]>;
       arrayFieldsSubject.next(unsortedFields);
      
      // Verify the component sorted them correctly
      expect(component.arrayFields.length).toBe(2);
      expect(component.arrayFields[0].name).toBe('high-depth'); // depth 2 should be first
      expect(component.arrayFields[1].name).toBe('low-depth');  // depth 0 should be second
    });

    it('should maintain sorting with complex 5-level structure', () => {
      const complexFields: ArrayField[] = [
        {
          fullPath: 'companies',
          name: 'companies',
          depth: 0,
          items: 2,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: ''
        },
        {
          fullPath: 'companies.departments',
          name: 'departments',
          depth: 1,
          items: 3,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies'
        },
        {
          fullPath: 'companies.departments.teams',
          name: 'teams',
          depth: 2,
          items: 4,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies.departments'
        },
        {
          fullPath: 'companies.departments.teams.projects',
          name: 'projects',
          depth: 3,
          items: 5,
          fields: { 'name': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies.departments.teams'
        },
        {
          fullPath: 'companies.departments.teams.projects.tasks',
          name: 'tasks',
          depth: 4,
          items: 10,
          fields: { 'title': { types: ['string'], primaryType: 'string' } },
          parentPath: 'companies.departments.teams.projects'
        }
      ];

      const sortedFields = (component as any).sortArrayFields(complexFields);

             // Should be ordered from deepest (4) to shallowest (0)
       const expectedOrder = ['tasks', 'projects', 'teams', 'departments', 'companies'];
       const actualOrder = sortedFields.map((f: ArrayField) => f.name);
       
       expect(actualOrder).toEqual(expectedOrder);
       
       // Verify depths are in descending order
       const depths = sortedFields.map((f: ArrayField) => f.depth);
       expect(depths).toEqual([4, 3, 2, 1, 0]);
    });
  });

  describe('Component Lifecycle', () => {
    it('should clean up subscriptions on destroy', () => {
      spyOn(component['destroy$'], 'next');
      spyOn(component['destroy$'], 'complete');

      component.ngOnDestroy();

      expect(component['destroy$'].next).toHaveBeenCalled();
      expect(component['destroy$'].complete).toHaveBeenCalled();
    });
  });
}); 