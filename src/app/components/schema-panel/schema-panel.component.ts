import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { SchemaGeneratorService } from '../../services/schema-generator.service';
import { UiStateService } from '../../services/ui-state.service';
import { BasePanelComponent } from '../base-panel/base-panel.component';

@Component({
  selector: 'app-schema-panel',
  standalone: true,
  imports: [CommonModule, BasePanelComponent],
  templateUrl: './schema-panel.component.html',
  styleUrls: ['./schema-panel.component.scss']
})
export class SchemaPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  minifiedData: any = null;
  formattedData: string = '';

  constructor(
    private schemaGenerator: SchemaGeneratorService,
    public uiState: UiStateService
  ) {}

  ngOnInit(): void {
    this.schemaGenerator.schema$
      .pipe(takeUntil(this.destroy$))
      .subscribe(minifiedData => {
        this.minifiedData = minifiedData;
        this.formattedData = this.schemaGenerator.getFormattedSchema();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Close the schema panel
   */
  closeSidebar(): void {
    this.uiState.hideSchemaSidebar();
  }

  /**
   * Copy minified data to clipboard
   */
  copyToClipboard(): void {
    if (this.formattedData) {
      navigator.clipboard.writeText(this.formattedData).then(() => {
        console.log('Minified JSON copied to clipboard');
      }).catch(err => {
        console.error('Failed to copy minified JSON:', err);
      });
    }
  }

  /**
   * Parse and colorize minified JSON text
   */
  getColorizedData(): any[] {
    if (!this.formattedData) return [];
    
    const lines = this.formattedData.split('\n');
    return lines.map((line: string, index: number) => {
      // Ensure we preserve the original line exactly
      if (!line.trim()) {
        return { tokens: [{ text: line, type: 'whitespace' }], originalLine: line };
      }
      return this.parseJsonLine(line);
    });
  }

  /**
   * Parse a single JSON line and identify tokens for colorization
   */
  private parseJsonLine(line: string): any {
    const tokens: any[] = [];
    
    // Simple regex-based parsing that preserves whitespace
    const regex = /(\s+)|("(?:[^"\\]|\\.)*")|([{}[\],:])|([^"\s{}[\],:]+)/g;
    let match;
    let lastIndex = 0;
    let isAfterColon = false;
    
    while ((match = regex.exec(line)) !== null) {
      const [fullMatch, whitespace, stringMatch, punctuation, other] = match;
      
      if (whitespace) {
        // Preserve all whitespace exactly as is
        tokens.push({ text: whitespace, type: 'whitespace' });
      } else if (stringMatch) {
        // Handle quoted strings
        const content = stringMatch.slice(1, -1); // Remove quotes
        const type = isAfterColon ? this.getValueType(content) : 'property';
        tokens.push({ text: stringMatch, type });
        isAfterColon = false;
      } else if (punctuation) {
        // Handle punctuation
        tokens.push({ text: punctuation, type: 'punctuation' });
        isAfterColon = punctuation === ':';
      } else if (other) {
        // Handle other tokens (numbers, booleans, etc.)
        const type = this.getValueType(other);
        tokens.push({ text: other, type });
        isAfterColon = false;
      }
    }
    
    return { tokens, originalLine: line };
  }

  /**
   * Get token type for syntax highlighting
   */
  private getTokenType(token: string): string {
    if (!token) return 'whitespace';
    
    // Boolean values
    if (token === 'true' || token === 'false') return 'boolean';
    
    // Null
    if (token === 'null') return 'null';
    
    // Numbers
    if (/^-?\d+(\.\d+)?$/.test(token)) return 'number';
    
    // Schema keywords
    const schemaKeywords = ['$schema', 'type', 'properties', 'items', 'required', 'description', 'examples'];
    if (schemaKeywords.includes(token.replace(/"/g, ''))) return 'keyword';
    
    return 'default';
  }

  /**
   * Get value type for colorization
   */
  private getValueType(value: string): string {
    // Type values
    const types = ['string', 'number', 'integer', 'boolean', 'array', 'object', 'null'];
    if (types.includes(value)) return 'type';
    
    // Schema URL
    if (value.startsWith('https://json-schema.org')) return 'url';
    
    // Mixed types description
    if (value.includes('Mixed types:')) return 'description';
    
    return 'string-value';
  }
} 