// GuestLayout.tsx
import { PropsWithChildren } from "react";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import { ToastContainer } from "react-toastify";

export default function Guest({ children }: PropsWithChildren) {
    return (
        <Theme>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
                {children}
                <ToastContainer />
            </div>
        </Theme>
    );
}
