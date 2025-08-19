import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FormEventHandler } from "react";
import ApplicationLogo from "@/Components/ApplicationLogo";

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="min-h-screen flex">
                {/* Left Side - Illustration / Branding */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 items-center justify-center p-10 text-white relative overflow-hidden">
                    <div className="text-center max-w-md animate-fadeIn">
                        <ApplicationLogo className="h-20 w-20 mx-auto mb-6 text-white" />
                        <h2 className="text-4xl font-bold mb-4">
                            Inventory Management System
                        </h2>
                        <p className="text-blue-100">
                            Kelola inventaris internal dengan aman, efisien, dan
                            real-time untuk mendukung keputusan strategis.
                        </p>
                    </div>
                    <div className="absolute inset-0 bg-pattern opacity-10" />
                </div>

                {/* Right Side - Login Form */}
                <div className="flex w-full md:w-1/2 items-center justify-center p-8 bg-gray-50">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-slideUp">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-blue-600">
                                Welcome Back
                            </h1>
                            <p className="text-gray-500 text-sm mt-2">
                                Masuk untuk melanjutkan ke sistem internal
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 text-sm font-medium text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.email}
                                    className="mt-2"
                                />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value="Password"
                                />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                                    autoComplete="current-password"
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.password}
                                    className="mt-2"
                                />
                            </div>

                            <PrimaryButton
                                className="w-full py-3 rounded-lg justify-center text-lg font-semibold shadow-md hover:shadow-lg hover:bg-blue-700 transition"
                                disabled={processing}
                            >
                                {processing ? "Logging in..." : "Log in"}
                            </PrimaryButton>
                        </form>

                        <div className="mt-8 text-center text-sm text-gray-500">
                            Tidak punya akun atau lupa password?{" "}
                            <span className="text-gray-700 font-medium">
                                Hubungi admin
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
