import { User } from "../user/user";

export interface AuthState {
  logged: boolean;
  currentUser?: User;
  loading: boolean;
  loadingInfo: boolean;
  errorMessage: any;
}
