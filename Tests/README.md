# Smart JSON Utils - Test Suite Documentation

## Overview

This directory contains comprehensive tests for the Smart JSON Utils application, specifically focusing on **5-level deep nested array sorting** functionality.

## Directory Structure

```
Tests/
├── Mocks/                           # Mock data files
│   ├── nested-5-depth-data.json           # Test data with 5 levels of nesting
│   ├── expected-companies-by-name-asc.json # Expected result for company sorting
│   ├── expected-tasks-by-hours-asc.json    # Expected result for task hour sorting
│   └── expected-tasks-by-title-asc.json    # Expected result for task title sorting
├── mock-verification.spec.ts        # Angular/Jasmine tests
├── mock-integration-test.ts         # Standalone Node.js tests
├── run-mock-tests.ts               # Test runner script
└── README.md                       # This documentation
```

## Test Data Structure

### 5-Level Deep Nesting Hierarchy:

1. **Level 1**: `companies[]` - Root level array
2. **Level 2**: `companies[].departments[]` - Department arrays within companies
3. **Level 3**: `companies[].departments[].teams[]` - Team arrays within departments
4. **Level 4**: `companies[].departments[].teams[].projects[]` - Project arrays within teams
5. **Level 5**: `companies[].departments[].teams[].projects[].tasks[]` - Task arrays within projects (deepest level)

### Sample Data:
```json
{
  "companies": [
    {
      "name": "TechCorp",
      "departments": [
        {
          "name": "Engineering",
          "teams": [
            {
              "name": "Frontend",
              "projects": [
                {
                  "name": "Web Portal",
                  "tasks": [
                    {
                      "title": "Setup React Components",
                      "estimatedHours": 40
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Test Coverage

### ✅ What's Tested:

1. **Single Level Sorting**:
   - Companies by name (ASC/DESC)
   - Companies by foundedYear
   - Departments by budget
   - Teams by teamLead
   - Projects by priority
   - Tasks by estimatedHours, title, assignee

2. **Multi-Level Simultaneous Sorting**:
   - Multiple arrays sorted at different levels simultaneously
   - Path normalization (handling `companies[0].departments[1].teams` paths)

3. **Edge Cases**:
   - No preferences set (original order maintained)
   - ASC vs DESC ordering
   - Mixed data types
   - Null value handling

4. **Path Normalization**:
   - Verifies that `companies[0].departments[1].teams` maps to `companies.departments.teams`
   - Tests that all instances of arrays are sorted correctly

## Running Tests

### Method 1: Angular/Jasmine Tests
```bash
# Run the Angular test suite (includes mock verification)
npm test
```

### Method 2: Standalone Node.js Tests
```bash
# Run only the mock verification tests
npx ts-node Tests/run-mock-tests.ts
```

### Method 3: Direct Integration Test
```bash
# Run the integration test directly
npx ts-node Tests/mock-integration-test.ts
```

## Test Scenarios

### 1. Level 1 - Companies Sorting
- **By Name ASC**: DataSystems → TechCorp
- **By FoundedYear ASC**: TechCorp (2010) → DataSystems (2015)

### 2. Level 2 - Departments Sorting
- **By Budget ASC**: Marketing (200K) → Engineering (500K)
- **By Name ASC**: Engineering → Marketing

### 3. Level 3 - Teams Sorting
- **By TeamLead ASC**: Alice Johnson → Charlie Brown
- **By Name DESC**: Frontend → Backend

### 4. Level 4 - Projects Sorting
- **By Priority ASC**: Critical → High → Medium
- **By Name ASC**: Mobile App → Web Portal

### 5. Level 5 - Tasks Sorting (Deepest Level)
- **By EstimatedHours ASC**: 24 → 32 → 40 hours
- **By Title ASC**: Design User Interface → Implement Authentication → Setup React Components
- **By Assignee DESC**: John Doe → Jane Smith → Bob Wilson

## Expected Results

The mock files contain the expected results for various sorting scenarios:

- `expected-companies-by-name-asc.json`: Companies sorted alphabetically
- `expected-tasks-by-hours-asc.json`: All task arrays sorted by estimated hours
- `expected-tasks-by-title-asc.json`: All task arrays sorted by title

## Verification Process

1. **Load Test Data**: Read the 5-level nested JSON structure
2. **Apply Sorting Preferences**: Set specific sorting rules for each level
3. **Execute Sorting**: Run the JSON processor sorting algorithm
4. **Compare Results**: Verify output matches expected mock results
5. **Report Status**: Display pass/fail status for each test scenario

## Key Features Verified

### ✅ Path Normalization
- Correctly maps `companies[0].departments[1].teams` to `companies.departments.teams`
- Ensures all instances of arrays are sorted consistently

### ✅ Deep Nesting Support
- Sorts arrays at all 5 levels simultaneously
- Maintains correct relationships between nested structures

### ✅ Preference Management
- Individual array preferences work independently
- Master preferences apply to all relevant arrays
- ASC/DESC ordering works at all levels

### ✅ Edge Case Handling
- No preferences: maintains original order
- Null values: sorted to end appropriately
- Mixed data types: converted and sorted correctly

## Success Criteria

**All tests must pass** for the Smart JSON Utils to be considered fully functional:

- ✅ 10/10 individual sorting tests
- ✅ Multi-level simultaneous sorting
- ✅ Path normalization verification
- ✅ Original order preservation (no preferences)
- ✅ ASC/DESC ordering verification

## Troubleshooting

If tests fail:

1. **Check Mock Data**: Ensure all JSON files in `Mocks/` are valid
2. **Verify Service Logic**: Test individual methods in `JsonProcessorService`
3. **Path Issues**: Check if array paths are being normalized correctly
4. **Sorting Logic**: Verify comparison logic for different data types

The test suite provides detailed output showing exactly which assertions fail, making debugging straightforward. 