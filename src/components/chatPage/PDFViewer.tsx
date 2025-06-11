"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import type { ToolbarSlot, TransformToolbarSlot } from "@react-pdf-viewer/toolbar";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import { useEffect } from "react";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFViewerProps {
    pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
    const toolbarPluginInstance = toolbarPlugin();
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

    // Security fix: Disable eval support in PDF.js to prevent arbitrary code execution
    useEffect(() => {
        if (typeof window !== 'undefined' && (window as any).pdfjsLib) {
            (window as any).pdfjsLib.GlobalWorkerOptions.isEvalSupported = false;
        }
    }, []);

    const transform: TransformToolbarSlot = (slot: ToolbarSlot) => ({
        ...slot,
        Download: () => <></>,
        SwitchTheme: () => <></>,
        Open: () => <></>,
    });

    return (
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.js">
            <div className="w-full h-[90vh] flex-col text-white !important flex">
                <div
                    className="align-center bg-[#eeeeee] flex p-1"
                    style={{
                        borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <Toolbar>{renderDefaultToolbar(transform)}</Toolbar>
                </div>
                <Viewer
                    fileUrl={pdfUrl}
                    plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
                />
            </div>
        </Worker>
    );
};

export default PDFViewer; 