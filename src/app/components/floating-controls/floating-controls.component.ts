import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { UiStateService } from '../../services/ui-state.service';
import { JsonProcessorService } from '../../services/json-processor.service';
import { SchemaGeneratorService } from '../../services/schema-generator.service';

@Component({
  selector: 'app-floating-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-controls.component.html',
  styleUrls: ['./floating-controls.component.scss']
})
export class FloatingControlsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  constructor(
    public uiState: UiStateService,
    private jsonProcessor: JsonProcessorService,
    private schemaGenerator: SchemaGeneratorService
  ) {}

  ngOnInit(): void {
    // Listen to JSON data changes to enable/disable schema button
    this.jsonProcessor.processedJson$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {
          this.schemaGenerator.generateSchema(data);
        } else {
          this.schemaGenerator.clearSchema();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Toggle sorting options sidebar
   */
  toggleSortingSidebar(): void {
    this.uiState.toggleSidebar();
  }

  /**
   * Toggle schema sidebar
   */
  toggleSchemaSidebar(): void {
    this.uiState.toggleSchemaSidebar();
  }
} 