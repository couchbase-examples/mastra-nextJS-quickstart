"use client";

import { Viewer, Worker } from "@react-pdf-viewer/core";
import { pageNavigationPlugin } from "@react-pdf-viewer/page-navigation";
import type { ToolbarSlot, TransformToolbarSlot } from "@react-pdf-viewer/toolbar";
import { toolbarPlugin } from "@react-pdf-viewer/toolbar";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

interface PDFViewerProps {
    pdfUrl: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfUrl }) => {
    const toolbarPluginInstance = toolbarPlugin();
    const pageNavigationPluginInstance = pageNavigationPlugin();
    const { renderDefaultToolbar, Toolbar } = toolbarPluginInstance;

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
                    // pdfjs-dist 3.x is affected by GHSA-wgrm-67xf-hhpq (CVE-2024-4367): a crafted
                    // font can run arbitrary JavaScript. @react-pdf-viewer pins pdfjs-dist to <4, so
                    // apply the upstream mitigation and disable eval in PDF.js font rendering.
                    transformGetDocumentParams={(params) => ({ ...params, isEvalSupported: false })}
                    plugins={[toolbarPluginInstance, pageNavigationPluginInstance]}
                />
            </div>
        </Worker>
    );
};

export default PDFViewer; 