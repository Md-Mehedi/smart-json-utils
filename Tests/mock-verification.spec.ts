import { TestBed } from '@angular/core/testing';
import { JsonProcessorService } from '../src/app/services/json-processor.service';
import * as fs from 'fs';
import * as path from 'path';

describe('Mock Data Verification - 5 Level Deep Nested Arrays', () => {
  let service: JsonProcessorService;
  let testData: any;
  let expectedCompaniesNameAsc: any;
  let expectedTasksHoursAsc: any;
  let expectedTasksTitleAsc: any;

  beforeAll(() => {
    // Load mock data files
    const mockDir = path.join(__dirname, 'Mocks');
    
    testData = JSON.parse(fs.readFileSync(path.join(mockDir, 'nested-5-depth-data.json'), 'utf8'));
    expectedCompaniesNameAsc = JSON.parse(fs.readFileSync(path.join(mockDir, 'expected-companies-by-name-asc.json'), 'utf8'));
    expectedTasksHoursAsc = JSON.parse(fs.readFileSync(path.join(mockDir, 'expected-tasks-by-hours-asc.json'), 'utf8'));
    expectedTasksTitleAsc = JSON.parse(fs.readFileSync(path.join(mockDir, 'expected-tasks-by-title-asc.json'), 'utf8'));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonProcessorService);
    service.clearPreferences(); // Start with clean state
  });

  describe('Level 1 - Companies Array Sorting', () => {
    it('should sort companies by name in ascending order', () => {
      // Set sorting preference for companies array
      service.updateArraySortPreference('companies', 'name');
      service.updateArraySortOrder('companies', 'asc');

      // Apply sorting
      const result = service['sortObjectKeys'](testData);

      // Verify companies are sorted: DataSystems, TechCorp
      expect(result.companies[0].name).toBe('DataSystems');
      expect(result.companies[1].name).toBe('TechCorp');

      // Verify the result matches our expected mock
      expect(result.companies[0].name).toBe(expectedCompaniesNameAsc.companies[0].name);
      expect(result.companies[1].name).toBe(expectedCompaniesNameAsc.companies[1].name);
    });

    it('should sort companies by foundedYear in ascending order', () => {
      service.updateArraySortPreference('companies', 'foundedYear');
      service.updateArraySortOrder('companies', 'asc');

      const result = service['sortObjectKeys'](testData);

      // TechCorp (2010) should come before DataSystems (2015)
      expect(result.companies[0].foundedYear).toBe(2010);
      expect(result.companies[1].foundedYear).toBe(2015);
      expect(result.companies[0].name).toBe('TechCorp');
      expect(result.companies[1].name).toBe('DataSystems');
    });
  });

  describe('Level 2 - Departments Array Sorting', () => {
    it('should sort departments by budget in ascending order', () => {
      service.updateArraySortPreference('companies.departments', 'budget');
      service.updateArraySortOrder('companies.departments', 'asc');

      const result = service['sortObjectKeys'](testData);

      // In TechCorp: Marketing (200000) should come before Engineering (500000)
      const techCorpDepts = result.companies.find((c: any) => c.name === 'TechCorp').departments;
      expect(techCorpDepts[0].budget).toBe(200000);
      expect(techCorpDepts[1].budget).toBe(500000);
      expect(techCorpDepts[0].name).toBe('Marketing');
      expect(techCorpDepts[1].name).toBe('Engineering');
    });

    it('should sort departments by name in ascending order', () => {
      service.updateArraySortPreference('companies.departments', 'name');
      service.updateArraySortOrder('companies.departments', 'asc');

      const result = service['sortObjectKeys'](testData);

      // In TechCorp: Engineering should come before Marketing
      const techCorpDepts = result.companies.find((c: any) => c.name === 'TechCorp').departments;
      expect(techCorpDepts[0].name).toBe('Engineering');
      expect(techCorpDepts[1].name).toBe('Marketing');
    });
  });

  describe('Level 3 - Teams Array Sorting', () => {
    it('should sort teams by teamLead in ascending order', () => {
      service.updateArraySortPreference('companies.departments.teams', 'teamLead');
      service.updateArraySortOrder('companies.departments.teams', 'asc');

      const result = service['sortObjectKeys'](testData);

      // In Engineering dept: Alice Johnson should come before Charlie Brown
      const engineeringTeams = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams;
      
      expect(engineeringTeams[0].teamLead).toBe('Alice Johnson');
      expect(engineeringTeams[1].teamLead).toBe('Charlie Brown');
    });

    it('should sort teams by name in descending order', () => {
      service.updateArraySortPreference('companies.departments.teams', 'name');
      service.updateArraySortOrder('companies.departments.teams', 'desc');

      const result = service['sortObjectKeys'](testData);

      // In Engineering dept: Frontend should come after Backend (desc order)
      const engineeringTeams = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams;
      
      expect(engineeringTeams[0].name).toBe('Frontend');
      expect(engineeringTeams[1].name).toBe('Backend');
    });
  });

  describe('Level 4 - Projects Array Sorting', () => {
    it('should sort projects by priority in ascending order', () => {
      service.updateArraySortPreference('companies.departments.teams.projects', 'priority');
      service.updateArraySortOrder('companies.departments.teams.projects', 'asc');

      const result = service['sortObjectKeys'](testData);

      // Priority order: Critical, High, Medium (alphabetical)
      const frontendProjects = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects;
      
      expect(frontendProjects[0].priority).toBe('High');
      expect(frontendProjects[1].priority).toBe('Medium');
    });

    it('should sort projects by name in ascending order', () => {
      service.updateArraySortPreference('companies.departments.teams.projects', 'name');
      service.updateArraySortOrder('companies.departments.teams.projects', 'asc');

      const result = service['sortObjectKeys'](testData);

      const frontendProjects = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects;
      
      expect(frontendProjects[0].name).toBe('Mobile App');
      expect(frontendProjects[1].name).toBe('Web Portal');
    });
  });

  describe('Level 5 - Tasks Array Sorting (Deepest Level)', () => {
    it('should sort tasks by estimatedHours in ascending order', () => {
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'estimatedHours');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'asc');

      const result = service['sortObjectKeys'](testData);

      // In Web Portal project: 24, 32, 40 hours
      const webPortalTasks = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects
        .find((p: any) => p.name === 'Web Portal').tasks;
      
      expect(webPortalTasks[0].estimatedHours).toBe(24);
      expect(webPortalTasks[1].estimatedHours).toBe(32);
      expect(webPortalTasks[2].estimatedHours).toBe(40);

      // Verify against expected mock
      const expectedFirstTask = expectedTasksHoursAsc.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects
        .find((p: any) => p.name === 'Web Portal').tasks[0];

      expect(webPortalTasks[0].estimatedHours).toBe(expectedFirstTask.estimatedHours);
    });

    it('should sort tasks by title in ascending order', () => {
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'title');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'asc');

      const result = service['sortObjectKeys'](testData);

      // In Web Portal project: Design, Implement, Setup (alphabetical)
      const webPortalTasks = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects
        .find((p: any) => p.name === 'Web Portal').tasks;
      
      expect(webPortalTasks[0].title).toBe('Design User Interface');
      expect(webPortalTasks[1].title).toBe('Implement Authentication');
      expect(webPortalTasks[2].title).toBe('Setup React Components');

      // Verify against expected mock
      const expectedTasks = expectedTasksTitleAsc.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects
        .find((p: any) => p.name === 'Web Portal').tasks;

      expect(webPortalTasks[0].title).toBe(expectedTasks[0].title);
      expect(webPortalTasks[1].title).toBe(expectedTasks[1].title);
      expect(webPortalTasks[2].title).toBe(expectedTasks[2].title);
    });

    it('should sort tasks by assignee in descending order', () => {
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'assignee');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'desc');

      const result = service['sortObjectKeys'](testData);

      const webPortalTasks = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects
        .find((p: any) => p.name === 'Web Portal').tasks;
      
      // Descending: John Doe, Jane Smith, Bob Wilson
      expect(webPortalTasks[0].assignee).toBe('John Doe');
      expect(webPortalTasks[1].assignee).toBe('Jane Smith');
      expect(webPortalTasks[2].assignee).toBe('Bob Wilson');
    });
  });

  describe('Multiple Level Sorting Simultaneously', () => {
    it('should sort multiple arrays at different levels simultaneously', () => {
      // Sort companies by name ASC
      service.updateArraySortPreference('companies', 'name');
      service.updateArraySortOrder('companies', 'asc');

      // Sort departments by budget ASC  
      service.updateArraySortPreference('companies.departments', 'budget');
      service.updateArraySortOrder('companies.departments', 'asc');

      // Sort tasks by estimatedHours ASC
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'estimatedHours');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'asc');

      const result = service['sortObjectKeys'](testData);

      // Verify companies are sorted
      expect(result.companies[0].name).toBe('DataSystems');
      expect(result.companies[1].name).toBe('TechCorp');

      // Verify TechCorp departments are sorted by budget
      const techCorpDepts = result.companies.find((c: any) => c.name === 'TechCorp').departments;
      expect(techCorpDepts[0].budget).toBe(200000); // Marketing
      expect(techCorpDepts[1].budget).toBe(500000); // Engineering

      // Verify tasks are sorted by hours in first available project
      const someTasks = result.companies
        .find((c: any) => c.name === 'TechCorp').departments
        .find((d: any) => d.name === 'Engineering').teams
        .find((t: any) => t.name === 'Frontend').projects
        .find((p: any) => p.name === 'Web Portal').tasks;
      
      expect(someTasks[0].estimatedHours).toBeLessThanOrEqual(someTasks[1].estimatedHours);
      expect(someTasks[1].estimatedHours).toBeLessThanOrEqual(someTasks[2].estimatedHours);
    });
  });

  describe('Path Normalization Verification', () => {
    it('should handle paths with array indices correctly', () => {
      // This tests the normalizeArrayPath functionality
      service.updateArraySortPreference('companies.departments.teams.projects.tasks', 'title');
      service.updateArraySortOrder('companies.departments.teams.projects.tasks', 'asc');

      const result = service['sortObjectKeys'](testData);

      // Verify that all tasks arrays are sorted, regardless of their position in the structure
      const allTaskArrays = [
        result.companies[0].departments[0].teams[0].projects[0].tasks,
        result.companies[0].departments[0].teams[0].projects[1].tasks,
        result.companies[0].departments[0].teams[1].projects[0].tasks,
        result.companies[0].departments[1].teams[0].projects[0].tasks,
        result.companies[1].departments[0].teams[0].projects[0].tasks
      ];

      allTaskArrays.forEach((tasks, index) => {
        if (tasks && tasks.length > 1) {
          for (let i = 0; i < tasks.length - 1; i++) {
            expect(tasks[i].title.localeCompare(tasks[i + 1].title)).toBeLessThanOrEqual(0);
          }
        }
      });
    });
  });

  describe('No Preferences Set - Original Order Maintained', () => {
    it('should maintain original order when no sorting preferences are set', () => {
      service.clearPreferences();

      const result = service['sortObjectKeys'](testData);

      // Should maintain original order for companies
      expect(result.companies[0].name).toBe('TechCorp');
      expect(result.companies[1].name).toBe('DataSystems');

      // Should maintain original order for tasks
      const webPortalTasks = result.companies[0].departments[0].teams[0].projects[0].tasks;
      expect(webPortalTasks[0].title).toBe('Setup React Components');
      expect(webPortalTasks[1].title).toBe('Design User Interface');
      expect(webPortalTasks[2].title).toBe('Implement Authentication');
    });
  });
}); 