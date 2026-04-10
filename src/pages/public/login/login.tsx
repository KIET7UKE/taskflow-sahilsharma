import { LoginForm } from "@/components/login-form"

/**
 * Login Page Component.
 * Provides a container for the LoginForm component, centered on the screen.
 * Handles the base layout for the authentication entry point.
 *
 * @returns {JSX.Element} The rendered Login page.
 */
export default function Login() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    )
}
