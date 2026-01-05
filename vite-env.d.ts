// Augment the NodeJS ProcessEnv interface to include API_KEY.
// This avoids conflicts with existing 'process' declarations from @types/node.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}
