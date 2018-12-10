import User from '../user';

export interface HandlerFunc {
  (data: any, user: User);
}
