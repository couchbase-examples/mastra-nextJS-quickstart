"use client";
import Header from "../../components/chatPage/Header";
import { Sidebar } from "@/components/chatPage/Sidebar";
import { useState } from "react";

export default function ChatLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {isOpen && <Sidebar isOpen />}
            <div className="min-h-screen flex flex-col">
                <Header isSidebarOpen={isOpen} setIsSidebarOpen={setIsOpen} />
                {children}
            </div>
        </>
    );
}
