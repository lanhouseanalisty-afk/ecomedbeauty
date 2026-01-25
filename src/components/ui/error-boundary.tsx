import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
                    <div className="flex max-w-md flex-col items-center text-center">
                        <div className="mb-4 rounded-full bg-destructive/10 p-3">
                            <AlertCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <h1 className="mb-2 text-2xl font-bold">Algo deu errado</h1>
                        <p className="mb-6 text-muted-foreground">
                            Ocorreu um erro inesperado na aplicação.
                        </p>
                        {this.state.error && (
                            <pre className="mb-6 max-h-40 w-full overflow-auto rounded bg-muted p-4 text-left text-xs text-muted-foreground">
                                {this.state.error.message}
                            </pre>
                        )}
                        <Button onClick={() => window.location.reload()}>
                            Recarregar página
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
