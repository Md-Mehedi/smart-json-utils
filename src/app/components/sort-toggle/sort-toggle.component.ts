import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sort-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      type="button" 
      [class]="'sort-order-btn ' + (size || '')"
      [class.asc]="sortOrder === 'asc'"
      [class.desc]="sortOrder === 'desc'"
      [style.background]="colorScheme === 'emerald' ? 'linear-gradient(135deg, #10b981, #059669)' : ''"
      (click)="toggle()"
      [title]="title || 'Toggle sort order between ascending and descending'">
      <i class="fas" [class]="sortOrder === 'asc' ? 'fa-sort-alpha-down' : 'fa-sort-alpha-up'"></i>
      {{ sortOrder.toUpperCase() }}
    </button>
  `,
  styleUrls: ['./sort-toggle.component.scss']
})
export class SortToggleComponent {
  @Input() sortOrder: 'asc' | 'desc' = 'asc';
  @Input() size: 'sm' | '' = ''; // '' for normal size, 'sm' for small
  @Input() colorScheme: 'primary' | 'emerald' = 'primary';
  @Input() title?: string;
  
  @Output() sortOrderChange = new EventEmitter<'asc' | 'desc'>();

  toggle(): void {
    const newOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.sortOrder = newOrder;
    this.sortOrderChange.emit(newOrder);
  }
} 