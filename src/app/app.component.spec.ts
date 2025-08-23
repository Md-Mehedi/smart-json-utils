import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { JsonProcessorService } from './services/json-processor.service';
import { UiStateService } from './services/ui-state.service';
import { BehaviorSubject } from 'rxjs';

describe('AppComponent', () => {
  let mockJsonProcessor: jasmine.SpyObj<JsonProcessorService>;
  let mockUiState: jasmine.SpyObj<UiStateService>;

  beforeEach(async () => {
    const jsonProcessorSpy = jasmine.createSpyObj('JsonProcessorService', [
      'validateAndAnalyzeJson',
      'getMasterSortOrder',
      'getSortingPreferences',
      'updateMasterNestingPreference',
      'updateArrayNestingPreference',
      'updateArraySortPreference',
      'updateMasterSortOrder',
      'updateArraySortOrder',
      'getArraySortOrder'
    ], {
      validation$: new BehaviorSubject({ isValid: true, message: 'Ready', type: 'info' }),
      arrayFields$: new BehaviorSubject([]),
      processedJson$: new BehaviorSubject(null)
    });

    // Setup return values for the mocked methods
    jsonProcessorSpy.getMasterSortOrder.and.returnValue('asc');
    jsonProcessorSpy.getArraySortOrder.and.returnValue('asc');
    jsonProcessorSpy.getSortingPreferences.and.returnValue({
      sortKeys: true,
      sortArrays: true,
      arraySortPreferences: {},
      arrayNestingPreferences: {}
    });

    const uiStateSpy = jasmine.createSpyObj('UiStateService', ['clearState'], {
      sidebarVisible$: new BehaviorSubject(false),
      floatingButtonVisible$: new BehaviorSubject(false),
      backToTopVisible$: new BehaviorSubject(false),
      resultsVisible$: new BehaviorSubject(false),
      isLoading$: new BehaviorSubject(false)
    });

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: JsonProcessorService, useValue: jsonProcessorSpy },
        { provide: UiStateService, useValue: uiStateSpy }
      ]
    }).compileComponents();

    mockJsonProcessor = TestBed.inject(JsonProcessorService) as jasmine.SpyObj<JsonProcessorService>;
    mockUiState = TestBed.inject(UiStateService) as jasmine.SpyObj<UiStateService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render header component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });

  it('should render json input component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-json-input')).toBeTruthy();
  });

  it('should render array options component', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-array-options')).toBeTruthy();
  });
}); 