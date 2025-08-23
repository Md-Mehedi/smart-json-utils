import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { JsonProcessorService } from '../../services/json-processor.service';
import { UiStateService } from '../../services/ui-state.service';
import { ArrayField } from '../../shared/interfaces/json-data.interface';
import { TYPE_ICONS } from '../../shared/constants/app.constants';
import { SortToggleComponent } from '../sort-toggle/sort-toggle.component';
import { BasePanelComponent } from '../base-panel/base-panel.component';

@Component({
  selector: 'app-array-options',
  standalone: true,
  imports: [CommonModule, FormsModule, SortToggleComponent, BasePanelComponent],
  templateUrl: './array-options.component.html',
  styleUrls: ['./array-options.component.scss']
})
export class ArrayOptionsComponent implements OnInit, OnDestroy {
  arrayFields: ArrayField[] = [];
  expandedArrays = new Set<string>();
  masterNestedChecked = true;
  masterNestedIndeterminate = false;
  masterSortOrder: 'asc' | 'desc' = 'asc';
  fieldSortOrder: 'asc' | 'desc' = 'asc'; // New: Field sort order for object keys
  smartSelectionMode: 'ID' | 'Name' = 'Name';
  
  private destroy$ = new Subject<void>();
  private stickyObserver: IntersectionObserver | null = null;

  constructor(
    private jsonProcessor: JsonProcessorService,
    public uiState: UiStateService
  ) {}

  ngOnInit(): void {
    // Initialize master sort order from service
    this.masterSortOrder = this.jsonProcessor.getMasterSortOrder();
    
    // Initialize field sort order from service
    this.fieldSortOrder = this.jsonProcessor.getFieldSortOrder();
    
    // Subscribe to array fields
    this.jsonProcessor.arrayFields$
      .pipe(takeUntil(this.destroy$))
      .subscribe(fields => {
        this.arrayFields = this.sortArrayFields(fields.filter(f => Object.keys(f.fields).length > 0));
        this.updateExpandedArrays();
        this.updateMasterCheckboxState();
        // Update master sort order display based on current preferences
        this.updateMasterSortOrderState();
        // Apply smart selection to new arrays
        this.applySmartSelection();
        // Set up intersection observer for sticky headers after data loads
        setTimeout(() => this.setupStickyHeaderObserver(), 100);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupStickyObserver();
  }

  closeSidebar(): void {
    this.uiState.hideSidebar();
  }

  toggleArrayExpansion(arrayPath: string): void {
    if (this.expandedArrays.has(arrayPath)) {
      this.expandedArrays.delete(arrayPath);
    } else {
      this.expandedArrays.add(arrayPath);
    }
  }

  expandAllArrays(): void {
    this.arrayFields.forEach(field => {
      if (Object.keys(field.fields).length > 0) {
        this.expandedArrays.add(field.fullPath);
      }
    });
  }

  collapseAllArrays(): void {
    this.expandedArrays.clear();
  }

  onMasterNestedChange(event: any): void {
    const checked = event.target.checked;
    this.jsonProcessor.updateMasterNestingPreference(checked);
    this.updateMasterCheckboxState();
  }

  onIndividualNestedChange(arrayPath: string, event: any): void {
    const checked = event.target.checked;
    this.jsonProcessor.updateArrayNestingPreference(arrayPath, checked);
    this.updateMasterCheckboxState();
  }

  onSortPreferenceChange(arrayPath: string, fieldName: string): void {
    this.jsonProcessor.updateArraySortPreference(arrayPath, fieldName);
  }

  getArraySortPreference(arrayPath: string): string {
    return this.jsonProcessor.getSortingPreferences().arraySortPreferences[arrayPath] || '';
  }

  getArrayNestingPreference(arrayPath: string): boolean {
    return this.jsonProcessor.getSortingPreferences().arrayNestingPreferences[arrayPath] !== false;
  }

  getFieldEntries(fields: { [key: string]: any }): { key: string, value: any }[] {
    return Object.entries(fields).map(([key, value]) => ({ key, value }));
  }

  getTypeIcon(type: string): string {
    return TYPE_ICONS[type as keyof typeof TYPE_ICONS] || 'fas fa-question';
  }

  toggleMasterSortOrder(): void {
    this.masterSortOrder = this.masterSortOrder === 'asc' ? 'desc' : 'asc';
    this.jsonProcessor.updateMasterSortOrder(this.masterSortOrder);
  }

  /**
   * Handles field sort order change from the sort toggle component
   */
  onFieldSortOrderChange(newOrder: 'asc' | 'desc'): void {
    this.fieldSortOrder = newOrder;
    this.jsonProcessor.updateFieldSortOrder(this.fieldSortOrder);
  }

  /**
   * Handles master sort order change from the sort toggle component
   */
  onMasterSortOrderChange(newOrder: 'asc' | 'desc'): void {
    this.masterSortOrder = newOrder;
    this.jsonProcessor.updateMasterSortOrder(this.masterSortOrder);
  }

  /**
   * Handles individual array sort order change from the sort toggle component
   */
  onIndividualSortOrderChange(arrayPath: string, newOrder: 'asc' | 'desc'): void {
    this.jsonProcessor.updateArraySortOrder(arrayPath, newOrder);
  }

  /**
   * Toggles the field sort order between ASC and DESC (kept for backward compatibility)
   */
  toggleFieldSortOrder(): void {
    this.fieldSortOrder = this.fieldSortOrder === 'asc' ? 'desc' : 'asc';
    this.jsonProcessor.updateFieldSortOrder(this.fieldSortOrder);
  }

  getArraySortOrder(arrayPath: string): 'asc' | 'desc' {
    return this.jsonProcessor.getArraySortOrder(arrayPath);
  }

  toggleArraySortOrder(arrayPath: string): void {
    const currentOrder = this.getArraySortOrder(arrayPath);
    const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
    this.jsonProcessor.updateArraySortOrder(arrayPath, newOrder);
  }

  /**
   * Toggles the smart selection mode between ID and Name
   */
  toggleSmartSelectionMode(): void {
    this.smartSelectionMode = this.smartSelectionMode === 'ID' ? 'Name' : 'ID';
    this.applySmartSelection();
  }

  /**
   * Applies smart selection to all arrays based on current mode
   */
  private applySmartSelection(): void {
    this.arrayFields.forEach(arrayField => {
      const bestField = this.findBestFieldMatch(arrayField);
      if (bestField) {
        this.jsonProcessor.updateArraySortPreference(arrayField.fullPath, bestField);
      }
    });
  }

  /**
   * Finds the best field match for an array based on smart selection mode
   */
  private findBestFieldMatch(arrayField: ArrayField): string | null {
    const fieldEntries = this.getFieldEntries(arrayField.fields);
    
    if (this.smartSelectionMode === 'ID') {
      // Step 1: Try exact matches for ID-related fields (case-insensitive)
      const exactMatch = fieldEntries.find(entry => {
        const keyLower = entry.key.toLowerCase();
        return keyLower === 'id' || keyLower === 'systemname' || keyLower === 'systemid';
      });
      if (exactMatch) {
        return exactMatch.key;
      }

      // Step 2: Try partial matches for ID-related fields
      const partialMatch = fieldEntries.find(entry => {
        const keyLower = entry.key.toLowerCase();
        return keyLower.includes('id') || keyLower.includes('systemname') || keyLower.includes('systemid');
      });
      if (partialMatch) {
        return partialMatch.key;
      }
    } else {
      // Name mode - original logic
      const targetFieldName = this.smartSelectionMode.toLowerCase(); // 'name'
      
      // Step 1: Try exact match (case-insensitive)
      const exactMatch = fieldEntries.find(entry => 
        entry.key.toLowerCase() === targetFieldName
      );
      if (exactMatch) {
        return exactMatch.key;
      }
    }

    // Step 2: Fallback to type-based selection with mode-specific exclusions
    return this.findBestFieldByType(fieldEntries);
  }

  /**
   * Finds the best field by type priority: string > number > boolean
   * Excludes conflicting fields based on current selection mode
   * Within each type, prefers fields containing "name", then alphabetical order
   */
  private findBestFieldByType(fieldEntries: { key: string, value: any }[]): string | null {
    // Filter out conflicting fields based on current mode
    let filteredEntries = fieldEntries;
    
    if (this.smartSelectionMode === 'Name') {
      // When in Name mode, exclude SystemName-related fields
      filteredEntries = fieldEntries.filter(entry => {
        const keyLower = entry.key.toLowerCase();
        return !keyLower.includes('system') && 
               !keyLower.includes('systemname') && 
               !keyLower.includes('systemid') &&
               !keyLower.includes('systemcode');
      });
      
      // If we filtered out everything, fall back to original list
      if (filteredEntries.length === 0) {
        filteredEntries = fieldEntries;
      }
    }
    
    if (this.smartSelectionMode === 'ID') {
      // When in ID mode, exclude generic Name fields when ID-related fields are available
      filteredEntries = fieldEntries.filter(entry => {
        const keyLower = entry.key.toLowerCase();
        // If it contains 'name' but not 'system' or 'id', and we have ID-related fields available, skip it
        if (keyLower.includes('name') && !keyLower.includes('system') && !keyLower.includes('id')) {
          const hasIdFields = fieldEntries.some(e => {
            const eLower = e.key.toLowerCase();
            return eLower.includes('system') || eLower.includes('id');
          });
          return !hasIdFields;
        }
        return true;
      });
      
      // If we filtered out everything, fall back to original list
      if (filteredEntries.length === 0) {
        filteredEntries = fieldEntries;
      }
    }

    const typePriority = ['string', 'number', 'boolean'];
    
    // Group fields by type
    const fieldsByType = new Map<string, { key: string, value: any }[]>();
    filteredEntries.forEach(entry => {
      const type = entry.value.primaryType;
      if (!fieldsByType.has(type)) {
        fieldsByType.set(type, []);
      }
      fieldsByType.get(type)!.push(entry);
    });

    // Find best match based on type priority
    for (const type of typePriority) {
      const fieldsOfType = fieldsByType.get(type);
      if (fieldsOfType && fieldsOfType.length > 0) {
        // If multiple fields of same type, prefer fields containing "name" first
        const nameFields = fieldsOfType.filter(field => 
          field.key.toLowerCase().includes('name')
        );
        
        if (nameFields.length > 0) {
          // Sort name fields alphabetically and return first
          const sortedNameFields = nameFields.sort((a, b) => a.key.localeCompare(b.key));
          return sortedNameFields[0].key;
        } else {
          // No name fields, sort all fields alphabetically and return first
          const sortedFields = fieldsOfType.sort((a, b) => a.key.localeCompare(b.key));
          return sortedFields[0].key;
        }
      }
    }

    // Last resort: return first available field from original list
    return fieldEntries.length > 0 ? fieldEntries[0].key : null;
  }

  private updateExpandedArrays(): void {
    // Keep arrays collapsed by default - user can expand manually
    // this.arrayFields.forEach(field => {
    //   if (Object.keys(field.fields).length > 0) {
    //     this.expandedArrays.add(field.fullPath);
    //   }
    // });
  }

  private updateMasterCheckboxState(): void {
    if (this.arrayFields.length === 0) {
      this.masterNestedChecked = true;
      this.masterNestedIndeterminate = false;
      return;
    }

    const preferences = this.jsonProcessor.getSortingPreferences().arrayNestingPreferences;
    const checkedCount = this.arrayFields.filter(field => 
      preferences[field.fullPath] !== false
    ).length;

    if (checkedCount === 0) {
      this.masterNestedChecked = false;
      this.masterNestedIndeterminate = false;
    } else if (checkedCount === this.arrayFields.length) {
      this.masterNestedChecked = true;
      this.masterNestedIndeterminate = false;
    } else {
      this.masterNestedChecked = false;
      this.masterNestedIndeterminate = true;
    }
  }

  private updateMasterSortOrderState(): void {
    // Update master sort order based on current service state
    this.masterSortOrder = this.jsonProcessor.getMasterSortOrder();
  }

  /**
   * Sorts array fields by depth (descending) then by name (ascending)
   * This ensures deepest nested arrays appear first, and arrays at the same depth are alphabetically ordered
   */
  private sortArrayFields(fields: ArrayField[]): ArrayField[] {
    return fields.sort((a, b) => {
      // First sort by depth (descending - higher depth first)
      if (a.depth !== b.depth) {
        return b.depth - a.depth;
      }
      // If depth is the same, sort by name (ascending)
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * Set up intersection observer to detect when headers are sticky
   */
  private setupStickyHeaderObserver(): void {
    // Clean up existing observer
    if (this.stickyObserver) {
      this.stickyObserver.disconnect();
    }

    const arrayHeaders = document.querySelectorAll('.array-header');
    if (arrayHeaders.length === 0) return;

    // Create intersection observer to detect when headers stick
    this.stickyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const header = entry.target as HTMLElement;
          // When header intersects with top of container, it's "stuck"
          if (entry.intersectionRatio < 1) {
            header.classList.add('stuck');
          } else {
            header.classList.remove('stuck');
          }
        });
      },
      {
        threshold: [0.99, 1], // Trigger when header is almost or fully visible
        rootMargin: '-1px 0px 0px 0px' // Small margin to detect sticking
      }
    );

    // Observe all array headers
    arrayHeaders.forEach(header => {
      this.stickyObserver?.observe(header);
    });
  }

  /**
   * Clean up intersection observer
   */
  private cleanupStickyObserver(): void {
    if (this.stickyObserver) {
      this.stickyObserver.disconnect();
      this.stickyObserver = null;
    }
  }
} 