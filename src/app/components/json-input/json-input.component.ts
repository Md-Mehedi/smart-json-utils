import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { JsonProcessorService } from '../../services/json-processor.service';
import { UiStateService } from '../../services/ui-state.service';
import { ValidationResult } from '../../shared/interfaces/json-data.interface';
import { APP_CONSTANTS } from '../../shared/constants/app.constants';

@Component({
  selector: 'app-json-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-input.component.html',
  styleUrls: ['./json-input.component.scss']
})
export class JsonInputComponent implements OnInit, OnDestroy {
  @ViewChild('textareaRef') textareaRef!: ElementRef<HTMLTextAreaElement>;
  
  jsonInput = '';
  validation: ValidationResult = { isValid: true, message: 'Ready', type: 'info' };
  
  private destroy$ = new Subject<void>();
  private inputChange$ = new Subject<string>();

  constructor(
    private jsonProcessor: JsonProcessorService,
    public uiState: UiStateService
  ) {}

  ngOnInit(): void {
    // Set up reactive input validation with debounce
    this.inputChange$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(value => {
        this.jsonProcessor.validateAndAnalyzeJson(value);
      });

    // Subscribe to validation results
    this.jsonProcessor.validation$
      .pipe(takeUntil(this.destroy$))
      .subscribe(validation => {
        this.validation = validation;
      });

    // Subscribe to array fields to show/hide UI elements
    this.jsonProcessor.arrayFields$
      .pipe(takeUntil(this.destroy$))
      .subscribe(arrayFields => {
        if (arrayFields.length > 0) {
          this.uiState.showArrayRelatedUI();
        } else {
          this.uiState.hideArrayRelatedUI();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onInputChange(): void {
    this.inputChange$.next(this.jsonInput);
  }

  async handleSort(): Promise<void> {
    if (!this.validation.isValid || !this.jsonInput.trim()) {
      return;
    }

    this.uiState.setLoading(true);

    try {
      // Simulate processing time for better UX
      await new Promise(resolve => setTimeout(resolve, APP_CONSTANTS.LOADER_DELAY));
      
      // Process the JSON
      this.jsonProcessor.processJson(this.jsonInput).subscribe(() => {
        this.uiState.showResults();
        this.uiState.setLoading(false);
        
        // Scroll to results after a short delay
        setTimeout(() => {
          this.scrollToResults();
        }, 100);
      });
    } catch (error) {
      console.error('Error processing JSON:', error);
      this.validation = {
        isValid: false,
        message: `Processing error: ${(error as Error).message}`,
        type: 'error'
      };
      this.uiState.setLoading(false);
    }
  }

  loadExample(): void {
    this.jsonInput = JSON.stringify(APP_CONSTANTS.EXAMPLE_JSON, null, 2);
    this.onInputChange();
  }

  clearInput(): void {
    this.jsonInput = '';
    this.validation = { isValid: true, message: 'Ready', type: 'info' };
    this.uiState.clearState();
    this.jsonProcessor.validateAndAnalyzeJson('');
  }

  private scrollToResults(): void {
    const resultsElement = document.querySelector('.results-section') as HTMLElement;
    if (resultsElement) {
      this.uiState.scrollToElement(resultsElement);
    }
  }
} 