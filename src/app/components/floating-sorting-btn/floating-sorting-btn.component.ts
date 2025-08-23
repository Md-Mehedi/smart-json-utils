import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStateService } from '../../services/ui-state.service';

@Component({
  selector: 'app-floating-sorting-btn',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floating-sorting-btn.component.html',
  styleUrls: ['./floating-sorting-btn.component.scss']
})
export class FloatingSortingBtnComponent {
  constructor(public uiState: UiStateService) {}

  toggleSidebar(): void {
    this.uiState.toggleSidebar();
  }
} 