import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { JsonInputComponent } from './components/json-input/json-input.component';
import { ArrayOptionsComponent } from './components/array-options/array-options.component';
import { SchemaPanelComponent } from './components/schema-panel/schema-panel.component';
import { JsonTreeComponent } from './components/json-tree/json-tree.component';
import { LoaderComponent } from './components/loader/loader.component';
import { BackToTopComponent } from './components/back-to-top/back-to-top.component';
import { FloatingControlsComponent } from './components/floating-controls/floating-controls.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    JsonInputComponent,
    ArrayOptionsComponent,
    SchemaPanelComponent,
    JsonTreeComponent,
    LoaderComponent,
    BackToTopComponent,
    FloatingControlsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'JSON Checker - Advanced JSON Object Sorter';
} 