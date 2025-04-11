
import { mockMissingTables } from "./mockDatabaseTables";

/**
 * Initialize the application
 * This should be called at app startup
 */
export const initializeApp = () => {
  // Initialize mocks for tables that don't exist yet
  if (process.env.NODE_ENV === 'development') {
    mockMissingTables();
  }
  
  // Add any other initialization code here
  console.log("Application initialized");
};
