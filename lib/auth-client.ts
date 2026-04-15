import { createAuthClient } from "better-auth/react";
import { getAuthClientBaseURL } from "./auth-app-url";

export const authClient = createAuthClient({
  baseURL: getAuthClientBaseURL(),
});
