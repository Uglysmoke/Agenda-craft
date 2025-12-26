
import { User, AuthSession } from '../types';

const USERS_KEY = 'agendacraft_users';
const SESSION_KEY = 'agendacraft_session';

export class AuthService {
  getUsers(): User[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  register(user: User): { success: boolean; message: string } {
    const users = this.getUsers();
    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, message: 'Registration successful.' };
  }

  login(credentials: User, rememberMe: boolean): { success: boolean; user?: User; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
    
    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const session: AuthSession = { user, rememberMe };
    if (rememberMe) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }

    return { success: true, user, message: 'Login successful.' };
  }

  logout(): void {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  getCurrentSession(): AuthSession | null {
    const localSession = localStorage.getItem(SESSION_KEY);
    if (localSession) return JSON.parse(localSession);
    
    const sessionSession = sessionStorage.getItem(SESSION_KEY);
    if (sessionSession) return JSON.parse(sessionSession);

    return null;
  }
}

export const authService = new AuthService();
