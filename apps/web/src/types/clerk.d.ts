declare module '@clerk/nextjs' {
  export function useAuth(): { getToken?: () => Promise<string | null> };
  export const ClerkProvider: any;
  export const SignIn: any;
  export const SignUp: any;
  export const SignedIn: any;
  export const SignedOut: any;
  export const SignInButton: any;
  export const UserButton: any;
}


