declare module "bcrypt" {
  export function hash(data: string, saltOrRounds: number): Promise<string>;
  export function compare(data: string, encrypted: string): Promise<boolean>;
}

declare module "cookie-parser" {
  import type { RequestHandler } from "express";
  export default function cookieParser(secret?: string): RequestHandler;
}

declare module "passport-jwt" {
  import { Strategy as PassportStrategy } from "passport";

  export class Strategy extends PassportStrategy {
    constructor(options: Record<string, unknown>, verify?: unknown);
  }

  export const ExtractJwt: {
    fromAuthHeaderAsBearerToken: () => (request: unknown) => string | null;
    fromExtractors: (
      extractors: Array<(request: unknown) => string | null>,
    ) => (request: unknown) => string | null;
  };
}

declare module "multer" {
  export function diskStorage(options: {
    destination: string;
    filename: (
      req: unknown,
      file: { originalname: string },
      callback: (error: Error | null, filename: string) => void,
    ) => void;
  }): unknown;
}

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
      }
    }
  }
}

export {};
