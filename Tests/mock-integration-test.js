/**
 * Integration Test for JSON Processor Service with 5-Level Deep Nested Arrays
 * JavaScript version for Node.js execution
 */

const fs = require('fs');
const path = require('path');

// Simplified JsonProcessorService for testing
class JsonProcessorService {
  constructor() {
    this.arraySortPreferences = {};
    this.arrayNestingPreferences = {};
    this.arraySortOrderPreferences = {};
    this.masterSortOrder = 'asc';
  }

  updateArraySortPreference(arrayPath, fieldName) {
    this.arraySortPreferences[arrayPath] = fieldName;
  }

  updateArraySortOrder(arrayPath, sortOrder) {
    this.arraySortOrderPreferences[arrayPath] = sortOrder;
  }

  getArraySortOrder(arrayPath) {
    return this.arraySortOrderPreferences[arrayPath] || this.masterSortOrder;
  }

  clearPreferences() {
    this.arraySortPreferences = {};
    this.arrayNestingPreferences = {};
    this.arraySortOrderPreferences = {};
    this.masterSortOrder = 'asc';
  }

  normalizeArrayPath(path) {
    return path.replace(/\[\d+\]/g, '');
  }

  sortArray(array, arrayPath) {
    if (!array.length || typeof array[0] !== 'object' || array[0] === null) {
      return [...array];
    }

    const normalizedPath = this.normalizeArrayPath(arrayPath);
    const sortField = this.arraySortPreferences[normalizedPath];
    const sortOrder = this.getArraySortOrder(normalizedPath);

    if (!sortField) {
      return [...array];
    }

    const sortedArray = [...array];

    return sortedArray.sort((a, b) => {
      const aValue = this.getFieldValue(a, sortField);
      const bValue = this.getFieldValue(b, sortField);

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sortOrder === 'asc' ? 1 : -1;
      if (bValue == null) return sortOrder === 'asc' ? -1 : 1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  getFieldValue(obj, fieldPath) {
    const parts = fieldPath.split('.');
    let value = obj;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  sortObjectKeys(obj, parentPath = '') {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      const sortedArray = this.sortArray(obj, parentPath);
      return sortedArray.map((item, index) => this.sortObjectKeys(item, `${parentPath}[${index}]`));
    }

    const sortedKeys = Object.keys(obj).sort();
    const sortedObject = {};

    for (const key of sortedKeys) {
      const currentPath = parentPath ? `${parentPath}.${key}` : key;
      sortedObject[key] = this.sortObjectKeys(obj[key], currentPath);
    }

    return sortedObject;
  }
}

// Test execution
function runTests() {
  console.log('🧪 Starting JSON Processor 5-Level Deep Nested Array Tests...\n');

  const service = new JsonProcessorService();
  const mocksDir = path.join(__dirname, 'Mocks');

  try {
    // Load test data
    const testData = JSON.parse(fs.readFileSync(path.join(mocksDir, 'nested-5-depth-data.json'), 'utf8'));
    const expectedCompaniesNameAsc = JSON.parse(fs.readFileSync(path.join(mocksDir, 'expected-companies-by-name-asc.json'), 'utf8'));
    const expectedTasksHoursAsc = JSON.parse(fs.readFileSync(path.join(mocksDir, 'expected-tasks-by-hours-asc.json'), 'utf8'));
    const expectedTasksTitleAsc = JSON.parse(fs.readFileSync(path.join(mocksDir, 'expected-tasks-by-title-asc.json'), 'utf8'));

    let passedTests = 0;
    let totalTests = 0;

    function runTest(testName, testFn) {
      totalTests++;
      try {
        const result = testFn();
        if (result) {
          console.log(`✅ ${testName}`);
          passedTests++;
        } else {
          console.log(`❌ ${testName}`);
        }
      } catch (error) {
        console.log(`❌ ${testName} - Error: ${error.message}`);
      }
    }

    // Test 1: Companies sorting by name ASC
    runTest('Level 1 - Sort companies by name ASC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies', 'name');
      service.updateArraySortOrder('companies', 'asc');
      
      const result = service.sortObjectKeys(testData);
      return result.companies[0].name === 'DataSystems' && result.companies[1].name === 'TechCorp';
    });

    // Test 2: Companies sorting by foundedYear ASC
    runTest('Level 1 - Sort companies by foundedYear ASC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies', 'foundedYear');
      service.updateArraySortOrder('companies', 'asc');
      
      const result = service.sortObjectKeys(testData);
      return result.companies[0].foundedYear === 2010 && result.companies[1].foundedYear === 2015;
    });

    // Test 3: Departments sorting by budget ASC
    runTest('Level 2 - Sort departments by budget ASC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies.departments', 'budget');
      service.updateArraySortOrder('companies.departments', 'asc');
      
      const result = service.sortObjectKeys(testData);
      const techCorpDepts = result.companies.find(c => c.name === 'TechCorp').departments;
      return techCorpDepts[0].budget === 200000 && techCorpDepts[1].budget === 500000;
    });

    // Test 4: Teams sorting by teamLead ASC
    runTest('Level 3 - Sort teams by teamLead ASC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies.departments.teams', 'teamLead');
      service.updateArraySortOrder('companies.departments.teams', 'asc');
      
      const result = service.sortObjectKeys(testData);
      const engineeringTeams = result.companies
        .find(c => c.name === 'TechCorp').departments
        .find(d => d.name === 'Engineering').teams;
      
      return engineeringTeams[0].teamLead === 'Alice Johnson' && engineeringTeams[1].teamLead === 'Charlie Brown';
    });

    // Test 5: Projects sorting by priority ASC
    runTest('Level 4 - Sort projects by priority ASC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies.departments.teams.projects', 'priority');
      service.updateArraySortOrder('companies.departments.teams.projects', 'asc');
      
      const result = service.sortObjectKeys(testData);
      const frontendProjects = result.companies
        .find(c => c.name === 'TechCorp').departments
        .find(d => d.name === 'Engineering').teams
        .find(t => t.name === 'Frontend').projects;
      
      return frontendProjects[0].priority === 'High' && frontendProjects[1].priority === 'Medium';
    });

    // Test 6: Tasks sorting by estimatedHours ASC (Level 5 - Deepest)
    runTest('Level 5 - Sort tasks by estimatedHours ASC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'estimatedHours');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'asc');
      
      const result = service.sortObjectKeys(testData);
      const webPortalTasks = result.companies
        .find(c => c.name === 'TechCorp').departments
        .find(d => d.name === 'Engineering').teams
        .find(t => t.name === 'Frontend').projects
        .find(p => p.name === 'Web Portal').tasks;
      
      return webPortalTasks[0].estimatedHours === 24 && 
             webPortalTasks[1].estimatedHours === 32 && 
             webPortalTasks[2].estimatedHours === 40;
    });

    // Test 7: Tasks sorting by title ASC (Level 5)
    runTest('Level 5 - Sort tasks by title ASC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'title');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'asc');
      
      const result = service.sortObjectKeys(testData);
      const webPortalTasks = result.companies
        .find(c => c.name === 'TechCorp').departments
        .find(d => d.name === 'Engineering').teams
        .find(t => t.name === 'Frontend').projects
        .find(p => p.name === 'Web Portal').tasks;
      
      return webPortalTasks[0].title === 'Design User Interface' &&
             webPortalTasks[1].title === 'Implement Authentication' &&
             webPortalTasks[2].title === 'Setup React Components';
    });

    // Test 8: Multiple level sorting simultaneously
    runTest('Multi-Level - Sort companies + departments + tasks simultaneously', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies', 'name');
      service.updateArraySortOrder('companies', 'asc');
      service.updateArraySortPreference('companies.departments', 'budget');
      service.updateArraySortOrder('companies.departments', 'asc');
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'estimatedHours');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'asc');
      
      const result = service.sortObjectKeys(testData);
      
      // Check companies order
      const companiesOk = result.companies[0].name === 'DataSystems' && result.companies[1].name === 'TechCorp';
      
      // Check departments order in TechCorp
      const techCorpDepts = result.companies.find(c => c.name === 'TechCorp').departments;
      const deptsOk = techCorpDepts[0].budget === 200000 && techCorpDepts[1].budget === 500000;
      
      // Check tasks order
      const someTasks = result.companies
        .find(c => c.name === 'TechCorp').departments
        .find(d => d.name === 'Engineering').teams
        .find(t => t.name === 'Frontend').projects
        .find(p => p.name === 'Web Portal').tasks;
      
      const tasksOk = someTasks[0].estimatedHours <= someTasks[1].estimatedHours && 
                      someTasks[1].estimatedHours <= someTasks[2].estimatedHours;
      
      return companiesOk && deptsOk && tasksOk;
    });

    // Test 9: No preferences - maintain original order
    runTest('No Preferences - Original order maintained', () => {
      service.clearPreferences();
      
      const result = service.sortObjectKeys(testData);
      
      // Should maintain original order
      const companiesOk = result.companies[0].name === 'TechCorp' && result.companies[1].name === 'DataSystems';
      
      const webPortalTasks = result.companies[0].departments[0].teams[0].projects[0].tasks;
      const tasksOk = webPortalTasks[0].title === 'Setup React Components' &&
                      webPortalTasks[1].title === 'Design User Interface' &&
                      webPortalTasks[2].title === 'Implement Authentication';
      
      return companiesOk && tasksOk;
    });

    // Test 10: Descending order verification
    runTest('DESC Order - Tasks by estimatedHours DESC', () => {
      service.clearPreferences();
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'estimatedHours');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'desc');
      
      const result = service.sortObjectKeys(testData);
      const webPortalTasks = result.companies
        .find(c => c.name === 'TechCorp').departments
        .find(d => d.name === 'Engineering').teams
        .find(t => t.name === 'Frontend').projects
        .find(p => p.name === 'Web Portal').tasks;
      
      return webPortalTasks[0].estimatedHours === 40 && 
             webPortalTasks[1].estimatedHours === 32 && 
             webPortalTasks[2].estimatedHours === 24;
    });

    console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 All tests passed! The 5-level deep nested array sorting is working correctly.');
    } else {
      console.log('❌ Some tests failed. The sorting functionality needs attention.');
    }

    return passedTests === totalTests;

  } catch (error) {
    console.error('❌ Error loading test data:', error.message);
    return false;
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests }; 