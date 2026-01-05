// This file augments the NodeJS namespace to add the API_KEY to ProcessEnv.
// It assumes @types/node is available (implied by the redeclaration error of 'process').

declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
