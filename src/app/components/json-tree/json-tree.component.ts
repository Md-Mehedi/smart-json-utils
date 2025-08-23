import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { Subject, takeUntil } from 'rxjs';
import { JsonProcessorService } from '../../services/json-processor.service';
import { UiStateService } from '../../services/ui-state.service';

@Component({
  selector: 'app-json-tree',
  standalone: true,
  imports: [CommonModule, NgxJsonViewerModule],
  templateUrl: './json-tree.component.html',
  styleUrls: ['./json-tree.component.scss']
})
export class JsonTreeComponent implements OnInit, OnDestroy {
  @ViewChild('jsonViewer') jsonViewer: any;
  
  processedJson: any = null;
  expanded = true;
  
  private destroy$ = new Subject<void>();

  constructor(
    private jsonProcessor: JsonProcessorService,
    public uiState: UiStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to processed JSON
    this.jsonProcessor.processedJson$
      .pipe(takeUntil(this.destroy$))
      .subscribe(json => {
        if (json) {
          this.processedJson = json;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  expandAll(): void {
    this.expanded = true;
    // Force re-render by updating the reference
    this.processedJson = { ...this.processedJson };
  }

  collapseAll(): void {
    this.expanded = false;
    // Force re-render by updating the reference
    this.processedJson = { ...this.processedJson };
  }

  async copyResult(): Promise<void> {
    if (!this.processedJson) return;

    try {
      const jsonString = JSON.stringify(this.processedJson, null, 2);
      await navigator.clipboard.writeText(jsonString);
      
      // Show visual feedback
      const btn = event?.target as HTMLElement;
      if (btn) {
        const originalText = btn.textContent;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        setTimeout(() => {
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy JSON';
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // Fallback: Create a text area and copy
      this.fallbackCopy();
    }
  }

  private fallbackCopy(): void {
    if (!this.processedJson) return;
    
    const textArea = document.createElement('textarea');
    textArea.value = JSON.stringify(this.processedJson, null, 2);
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }

  resetToTop(): void {
    this.uiState.clearState();
    this.uiState.scrollToTop();
    this.processedJson = null;
    this.expanded = true;
  }
} 