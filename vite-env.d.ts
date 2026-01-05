// Removed missing 'vite/client' reference
// Used 'var' instead of 'const' to avoid redeclaration errors with existing types

declare var process: {
  env: {
    API_KEY: string;
    [key: string]: string | undefined;
  }
};