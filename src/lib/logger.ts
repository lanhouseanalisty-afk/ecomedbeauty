/**
 * Structured Logging System
 * Provides consistent logging across the application with different log levels
 */

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
}

interface LogContext {
    [key: string]: any;
}

class Logger {
    private isDevelopment = import.meta.env.DEV;
    // private isProduction = import.meta.env.PROD;

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
    }

    debug(message: string, context?: LogContext): void {
        if (this.isDevelopment) {
            console.debug(this.formatMessage(LogLevel.DEBUG, message, context));
        }
    }

    info(message: string, context?: LogContext): void {
        console.info(this.formatMessage(LogLevel.INFO, message, context));
    }

    warn(message: string, context?: LogContext): void {
        console.warn(this.formatMessage(LogLevel.WARN, message, context));
    }

    error(message: string, error?: Error, context?: LogContext): void {
        const errorContext = {
            ...context,
            ...(error && {
                errorMessage: error.message,
                errorStack: error.stack,
                errorName: error.name,
            }),
        };

        console.error(this.formatMessage(LogLevel.ERROR, message, errorContext));

        // Future Sentry integration here
    }
}

export const logger = new Logger();
