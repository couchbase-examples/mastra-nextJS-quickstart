"use Client";
import Link from "next/link";
import Image from "next/image";

export default function Header({
    isSidebarOpen,
    setIsSidebarOpen,
}: Readonly<{
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
}>) {
    return (
        <header className="sticky top-0 z-30 bg-white w-full border-b border-b-slate-200 shadow-sm">
            <div className="h-16 py-4 container">
                <nav className="flex justify-between mx-10">
                    <button
                        className="mr-10"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? (
                            <Image
                                src="/images/hide_sidebar.svg"
                                alt="close"
                                width={30}
                                height={30}
                                className="mr-2"
                            />
                        ) : (
                            <Image
                                src="/images/show_sidebar.svg"
                                alt="open"
                                width={30}
                                height={30}
                                className="mr-2"
                            />
                        )}
                    </button>
                    <Link
                        href="/"
                        className="hover:text-slate-600 cursor-pointer flex items-center"
                    >
                        <Image
                            src="/images/couchbase.svg"
                            alt=""
                            width={25}
                            height={25}
                            className="mr-4"
                        />
                        <span className="text-2xl font-medium">PDF Chat App</span>
                    </Link>
                </nav>
            </div>
        </header>
    );
}