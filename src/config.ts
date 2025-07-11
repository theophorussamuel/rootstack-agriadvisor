// src/config.ts
// Utility to access environment variables in a Vite + React project

export const API_URL = import.meta.env.VITE_API_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;
export const ENV = import.meta.env.VITE_ENV;
export const PUBLIC_KEY = import.meta.env.VITE_PUBLIC_KEY;

// Example usage:
// import { API_URL, APP_NAME, ENV, PUBLIC_KEY } from './config';
// console.log(API_URL, APP_NAME, ENV, PUBLIC_KEY);
