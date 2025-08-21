import Features from "@/Components/Landing/Features";
import Footbar from "@/Components/Landing/Footbar";
import InternalWorkflow from "@/Components/Landing/InternalWorkFlow";
import Jumbotron from "@/Components/Landing/Jumbotron";
import Navbar from "@/Components/Landing/Navbar";
import ScrollToTopButton from "@/Components/Landing/ScrollToTopButton";
import SecurityAudit from "@/Components/Landing/SecurityAudit";
import SystemOverview from "@/Components/Landing/SystemOverview";
import Team from "@/Components/Landing/Team";
import Guest from "@/Layouts/GuestLayout";
import React from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head } from "@inertiajs/react";
import { ToastContainer } from "react-toastify";
export default function Home() {
    return (
        <GuestLayout>
            <Head title="Home" />
            <div className="font-sans">
                <Navbar />
                <Jumbotron />
                <InternalWorkflow />
                <Features />
                <SystemOverview />
                <SecurityAudit />
                <Team />
                <Footbar />
                <ScrollToTopButton />
                <ToastContainer />
            </div>
        </GuestLayout>
    );
}
