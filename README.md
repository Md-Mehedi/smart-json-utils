# JSON Checker - Advanced JSON Object Sorter

A modern Angular 18 application for sorting and analyzing JSON objects with advanced array sorting capabilities and an intuitive UI.

## Features

- 🚀 **Angular 18** with standalone components
- 💅 **Modern SCSS** styling with CSS variables
- 📱 **Responsive design** for all devices
- 🎯 **Real-time JSON validation** with debounced input
- 🔄 **Advanced array sorting** with nested field support
- 🌳 **Interactive JSON tree view** with expand/collapse
- 🎛️ **Sliding options panel** for array configuration
- 💾 **LocalStorage persistence** for user preferences
- 🎨 **Glass morphism UI** with blur effects
- ⚡ **Reactive programming** with RxJS

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── header/
│   │   ├── json-input/
│   │   ├── array-options/
│   │   ├── json-tree/
│   │   ├── loader/
│   │   ├── back-to-top/
│   │   └── floating-sorting-btn/
│   ├── services/
│   │   ├── json-processor.service.ts
│   │   ├── json-tree.service.ts
│   │   └── ui-state.service.ts
│   ├── shared/
│   │   ├── interfaces/
│   │   ├── constants/
│   │   └── utils/
│   ├── app.component.ts
│   └── app.component.scss
├── assets/
├── styles.scss
├── main.ts
└── index.html
```

## Components Overview

### Core Components

- **HeaderComponent**: Navigation bar with branding
- **JsonInputComponent**: Main input area with validation and controls
- **ArrayOptionsComponent**: Sliding panel for configuring array sorting
- **JsonTreeComponent**: Expandable tree view for JSON output
- **LoaderComponent**: Animated loading indicator

### UI Components

- **BackToTopComponent**: Floating button to scroll to top
- **FloatingSortingBtnComponent**: Fixed button to open sorting options

### Services

- **JsonProcessorService**: Handles JSON validation, parsing, and sorting
- **JsonTreeService**: Manages JSON tree rendering and interactions
- **UiStateService**: Manages application UI state and interactions

## Key Features

### Advanced Array Sorting

- Automatic detection of nested arrays
- Configurable sorting by any primitive field
- Support for dot-notation field paths (e.g., `user.profile.name`)
- Individual nesting preferences per array
- Master toggle for all array nesting options

### JSON Tree Visualization

- Syntax-highlighted JSON display
- Expandable/collapsible nodes
- Type indicators for different value types
- Compact comma formatting
- Full expand/collapse controls

### User Experience

- Real-time validation with visual feedback
- Smooth animations and transitions
- Auto-scroll to results
- Copy to clipboard functionality
- Responsive design for mobile/tablet

## Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd json-checker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Build for production**:
   ```bash
   npm run build
   # or
   ng build
   ```

## Usage

1. **Input JSON**: Paste or type JSON in the input area
2. **Validation**: Real-time validation with error messages
3. **Array Options**: Configure sorting for detected arrays
4. **Sort**: Click "Sort JSON" to process and display results
5. **Explore**: Use the tree view to explore sorted JSON
6. **Copy**: Copy the sorted JSON to clipboard

## Development

### Adding New Components

```bash
ng generate component components/my-component --standalone
```

### Adding New Services

```bash
ng generate service services/my-service
```

### Code Style

- Use TypeScript strict mode
- Follow Angular style guide
- Use SCSS with BEM methodology
- Implement reactive patterns with RxJS

## Technologies Used

- **Angular 18** - Framework
- **TypeScript** - Language
- **SCSS** - Styling
- **RxJS** - Reactive programming
- **Font Awesome** - Icons
- **Inter Font** - Typography

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Author

Created with ❤️ for advanced JSON processing needs. 