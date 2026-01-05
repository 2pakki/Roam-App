// References removed to fix "Cannot find type definition file" errors

declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
    [key: string]: string | undefined;
  }
}