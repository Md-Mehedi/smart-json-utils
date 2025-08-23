export const APP_CONSTANTS = {
  APP_NAME: 'Smart JSON Utils',
  VERSION: '1.0.0',
  AUTHOR: 'Developer',
  
  // UI Constants
  ANIMATION_DURATION: 300,
  LOADER_DELAY: 1500,
  
  // JSON Processing
  MAX_JSON_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_DEPTH: 50,
  
  // Local Storage Keys
  STORAGE_KEYS: {
    ARRAY_SORT_PREFERENCES: 'json-checker.array-sort-preferences',
    ARRAY_NESTING_PREFERENCES: 'json-checker.array-nesting-preferences',
    LAST_INPUT: 'json-checker.last-input'
  },
  
  // Default Examples
  EXAMPLE_JSON: {
    systemName: "MyApp",
    names: [
      {
        name: "John",
        dimension: [
          {
            itemName: "height",
            count: 180,
            measure: "cm",
            routes: {
              state: "active",
              outputPath: "/data",
              name: {
                displayname: "Height Measurement",
                originalname: "height_measure"
              }
            }
          }
        ],
        algorithms: [
          {
            items: [
              {
                isLocked: false
              }
            ]
          }
        ]
      }
    ]
  }
};

export const TYPE_ICONS = {
  string: 'fas fa-quote-right',
  number: 'fas fa-hashtag',
  boolean: 'fas fa-toggle-on',
  object: 'fas fa-cube',
  array: 'fas fa-list',
  null: 'fas fa-ban'
}; 