import { Component, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-base-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './base-panel.component.html',
  styleUrls: ['./base-panel.component.scss']
})
export class BasePanelComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() panelClass: string = '';
  @Input() showCopyButton: boolean = false;
  @Input() copyButtonTitle: string = 'Copy to clipboard';
  @Input() headerActionsTemplate: TemplateRef<any> | null = null;
  
  @Output() close = new EventEmitter<void>();
  @Output() copy = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }

  onCopy(): void {
    this.copy.emit();
  }
} 