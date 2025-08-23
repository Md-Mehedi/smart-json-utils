# 🚀 Smart JSON Utils

[![Angular](https://img.shields.io/badge/Angular-18.0-DD0031?style=flat&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat&logo=reactivex&logoColor=white)](https://rxjs.dev/)
[![SCSS](https://img.shields.io/badge/SCSS-3-CF649A?style=flat&logo=sass&logoColor=white)](https://sass-lang.com/)
[![Jasmine](https://img.shields.io/badge/Jasmine-5.1-8A4182?style=flat&logo=jasmine&logoColor=white)](https://jasmine.github.io/)
[![Karma](https://img.shields.io/badge/Karma-6.4-56C5A8?style=flat&logo=karma&logoColor=white)](https://karma-runner.github.io/)

> Smart JSON Utils was born from the need to handle complex nested JSON structures in enterprise applications. Traditional JSON tools often fall short when dealing with deep nesting and advanced sorting requirements. This tool fills that gap by providing intelligent processing capabilities that understand the relationships between data structures.

## 📋 Quick Summary

Smart JSON Utils is a powerful web application that intelligently processes, sorts, and visualizes JSON data structures. It features **5-level deep nested array sorting**, real-time validation, interactive tree visualization, and persistent user preferences. Perfect for developers, data analysts, and anyone working with complex JSON structures.

## ✨ Key Features

### 🎯 **Smart JSON Processing**
- **Real-time JSON validation** with descriptive error messages
- **Intelligent array detection** with automatic field discovery
- **5-level deep nesting support** for complex data structures
- **Path normalization** handling (e.g., `users[0].addresses` → `users.addresses`)
- **Cascading sort logic** with tiebreaker support for multiple fields

### 🌳 **Interactive Visualization**
- **Expandable JSON tree view** with syntax highlighting
- **Schema panel** showing minified JSON structure
- **Type indicators** for different value types (string, number, boolean, etc.)
- **Copy to clipboard** functionality for processed results
- **Smooth animations** and modern glass morphism UI design

### ⚙️ **Advanced Configuration**
- **Sliding options panel** for array sorting configuration
- **Individual array preferences** with field-specific sorting
- **Master controls** for bulk operations across all arrays
- **ASC/DESC ordering** for each array independently
- **LocalStorage persistence** for user preferences and settings

### 📱 **Modern User Experience**
- **Responsive design** optimized for desktop, tablet, and mobile
- **Floating controls** for easy access to key functions
- **Back-to-top button** for long JSON structures
- **Debounced input** to prevent excessive processing
- **Loading indicators** and smooth transitions

### 🧪 **Comprehensive Testing**
- **44+ unit tests** covering all core functionality
- **Mock integration tests** with 5-level deep nesting verification
- **Edge case handling** for null values, mixed types, and malformed JSON
- **Preference persistence testing** with LocalStorage validation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Modern web browser with ES6+ support

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/smart-json-utils.git
   cd smart-json-utils
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm start
   # or
   ng serve
   ```
   Navigate to `http://localhost:4200` - the app will automatically reload when you change source files.

4. **Run tests:**
   ```bash
   npm test
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```
   The build artifacts will be stored in the `dist/` directory.

## 📖 How to Use

### Basic Usage
1. **Input JSON**: Paste or type your JSON data in the input area
2. **Real-time Validation**: See instant validation feedback with error highlighting
3. **Configure Arrays**: Click the floating sort button to open the options panel
4. **Set Preferences**: Choose sorting fields and order (ASC/DESC) for each detected array
5. **Process**: Click "Sort JSON" to apply your configurations
6. **Explore Results**: Use the interactive tree view to browse the sorted structure
7. **Export**: Copy the sorted JSON to clipboard for use elsewhere

### Advanced Features
- **Nested Field Sorting**: Use dot-notation paths like `user.profile.name` for deep field access
- **Master Controls**: Toggle all array preferences at once using master switches
- **Schema View**: Access the schema panel to see a minified structure overview
- **Preference Persistence**: Your settings are automatically saved and restored

## 🏗️ Project Architecture

### Component Structure
```
src/app/
├── components/
│   ├── header/                # Navigation and branding
│   ├── json-input/            # Main input area with validation
│   ├── array-options/         # Sliding configuration panel  
│   ├── schema-panel/          # JSON structure visualization
│   ├── json-tree/             # Interactive tree view
│   ├── floating-controls/     # Fixed action buttons
│   ├── loader/                # Loading animations
│   └── back-to-top/           # Scroll-to-top functionality
├── services/
│   ├── json-processor.service.ts    # Core JSON processing logic
│   ├── json-tree.service.ts         # Tree rendering management
│   ├── schema-generator.service.ts  # Schema analysis
│   └── ui-state.service.ts          # Application state management
├── shared/
│   ├── interfaces/            # TypeScript interfaces
│   ├── constants/             # Application constants
│   └── utils/                 # Utility functions
└── assets/
    ├── styles/                # Global stylesheets
    └── images/                # Static assets
```

### Key Services

- **JsonProcessorService**: Handles JSON validation, parsing, array detection, and intelligent sorting with cascading logic
- **JsonTreeService**: Manages the interactive tree view rendering and user interactions
- **SchemaGeneratorService**: Analyzes JSON structure and generates minified schema representations
- **UiStateService**: Centralized state management for UI components and user interactions

## 🤝 How to Contribute

We welcome contributions! Here's how you can help make Smart JSON Utils even better:

### Getting Started
1. **Fork the repository** on GitHub
2. **Clone your fork** locally: `git clone https://github.com/your-username/smart-json-utils.git`
3. **Create a feature branch**: `git checkout -b feature/amazing-new-feature`
4. **Install dependencies**: `npm install`
5. **Start development**: `npm start`

### Development Guidelines
- **Code Style**: Follow Angular style guide and use TypeScript strict mode
- **Testing**: Write unit tests for new features (aim for >80% coverage)
- **SCSS**: Use BEM methodology and CSS custom properties
- **Components**: Create standalone components with reactive patterns
- **Commit Messages**: Use conventional commit format (`feat:`, `fix:`, `docs:`, etc.)

### Types of Contributions
- 🐛 **Bug fixes**: Fix issues and improve stability
- ✨ **New features**: Add sorting algorithms, UI improvements, export formats
- 📚 **Documentation**: Improve README, add code comments, create tutorials
- 🎨 **UI/UX**: Enhance design, accessibility, and user experience
- 🧪 **Testing**: Add test cases, improve coverage, performance tests
- 🔧 **Infrastructure**: Build scripts, CI/CD, deployment improvements

### Submitting Changes
1. **Run tests**: `npm test` - ensure all tests pass
2. **Build project**: `npm run build` - verify production build works
3. **Commit changes**: Follow conventional commit format
4. **Push to fork**: `git push origin feature/your-feature-name`
5. **Create Pull Request**: Provide clear description of changes

### Code Review Process
- All submissions require review before merging
- Automated tests must pass (GitHub Actions CI/CD)
- Maintain backward compatibility when possible
- Update documentation for user-facing changes

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 18.0 | Modern web framework with standalone components |
| **TypeScript** | 5.4 | Type-safe JavaScript with advanced tooling |
| **RxJS** | 7.8 | Reactive programming for async operations |
| **SCSS** | 3.0 | Advanced CSS with variables and mixins |
| **ngx-json-viewer** | 3.2 | Interactive JSON tree visualization |
| **Jasmine** | 5.1 | Behavior-driven testing framework |
| **Karma** | 6.4 | Test runner for unit tests |

### Development Tools
- **Angular CLI**: Project scaffolding and build tools
- **ESLint**: Code linting and style enforcement  
- **Prettier**: Code formatting
- **Chrome DevTools**: Debugging and performance analysis


<!-- ## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. -->

## 🙏 Acknowledgments

- **Angular Team**: For the amazing framework and tools
- **RxJS Contributors**: For powerful reactive programming capabilities
- **Community Contributors**: Thank you to everyone who contributes to this project
- **ngx-json-viewer**: For the excellent JSON visualization component

---

**Made with ❤️ by [MD Mehedi Hasan](https://github.com/your-username)**

*Star ⭐ this repository if you find it helpful!* 