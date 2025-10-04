// Custom type declarations for Next.js modules
// This file helps TypeScript understand Next.js imports

declare module 'next/image' {
  import { ComponentType } from 'react';
  const Image: ComponentType<any>;
  export default Image;
}

declare module 'next/navigation' {
  export function useRouter(): any;
  export function usePathname(): string;
  export function useSearchParams(): any;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module 'next/server' {
  export class NextRequest extends Request {}
  export class NextResponse extends Response {
    static json(data: any, init?: ResponseInit): NextResponse;
  }
}
