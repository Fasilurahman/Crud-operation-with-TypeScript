import * as expressSession from 'express-session';

declare module 'express-session' {
    interface SessionData {
        user_id?: string;  // Add the user_id property
    }
}
