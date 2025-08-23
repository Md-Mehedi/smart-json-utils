import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private sidebarVisibleSubject = new BehaviorSubject<boolean>(false);
  private schemaSidebarVisibleSubject = new BehaviorSubject<boolean>(false);
  private floatingButtonVisibleSubject = new BehaviorSubject<boolean>(false);
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private resultsVisibleSubject = new BehaviorSubject<boolean>(false);
  private backToTopVisibleSubject = new BehaviorSubject<boolean>(false);

  public sidebarVisible$ = this.sidebarVisibleSubject.asObservable();
  public schemaSidebarVisible$ = this.schemaSidebarVisibleSubject.asObservable();
  public floatingButtonVisible$ = this.floatingButtonVisibleSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public resultsVisible$ = this.resultsVisibleSubject.asObservable();
  public backToTopVisible$ = this.backToTopVisibleSubject.asObservable();

  constructor() {
    // Listen to scroll events for back to top button
    this.setupScrollListener();
  }

  /**
   * Shows the sorting options sidebar
   */
  showSidebar(): void {
    this.sidebarVisibleSubject.next(true);
    this.floatingButtonVisibleSubject.next(false);
  }

  /**
   * Hides the sorting options sidebar
   */
  hideSidebar(): void {
    this.sidebarVisibleSubject.next(false);
    this.floatingButtonVisibleSubject.next(true);
  }

  /**
   * Shows the schema sidebar
   */
  showSchemaSidebar(): void {
    this.schemaSidebarVisibleSubject.next(true);
    // Hide sorting options sidebar when schema is shown
    this.sidebarVisibleSubject.next(false);
  }

  /**
   * Hides the schema sidebar
   */
  hideSchemaSidebar(): void {
    this.schemaSidebarVisibleSubject.next(false);
  }

  /**
   * Toggles the schema sidebar visibility
   */
  toggleSchemaSidebar(): void {
    const isVisible = this.schemaSidebarVisibleSubject.value;
    if (isVisible) {
      this.hideSchemaSidebar();
    } else {
      this.showSchemaSidebar();
    }
  }

  /**
   * Toggles the sidebar visibility
   */
  toggleSidebar(): void {
    const isVisible = this.sidebarVisibleSubject.value;
    if (isVisible) {
      this.hideSidebar();
    } else {
      this.showSidebar();
    }
  }

  /**
   * Shows the floating sorting button
   */
  showFloatingButton(): void {
    this.floatingButtonVisibleSubject.next(true);
  }

  /**
   * Hides the floating sorting button
   */
  hideFloatingButton(): void {
    this.floatingButtonVisibleSubject.next(false);
  }

  /**
   * Sets loading state
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Shows the results section
   */
  showResults(): void {
    this.resultsVisibleSubject.next(true);
  }

  /**
   * Hides the results section
   */
  hideResults(): void {
    this.resultsVisibleSubject.next(false);
  }

  /**
   * Clears all UI state (used when clearing input)
   */
  clearState(): void {
    this.hideSidebar();
    this.hideFloatingButton();
    this.hideResults();
    this.setLoading(false);
  }

  /**
   * Shows UI elements when arrays are detected
   */
  showArrayRelatedUI(): void {
    // Only show floating button, not sidebar (user must click to show sidebar)
    this.showFloatingButton();
  }

  /**
   * Hides UI elements when no arrays are detected
   */
  hideArrayRelatedUI(): void {
    this.hideSidebar();
    this.hideFloatingButton();
  }

  /**
   * Scrolls to the top of the page
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Scrolls to a specific element
   */
  scrollToElement(element: HTMLElement): void {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }

  /**
   * Sets up scroll listener for back to top button
   */
  private setupScrollListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.backToTopVisibleSubject.next(scrollTop > 300);
      });
    }
  }

  /**
   * Gets current sidebar visibility state
   */
  get isSidebarVisible(): boolean {
    return this.sidebarVisibleSubject.value;
  }

  /**
   * Gets current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }

  /**
   * Gets current results visibility state
   */
  get areResultsVisible(): boolean {
    return this.resultsVisibleSubject.value;
  }
} 