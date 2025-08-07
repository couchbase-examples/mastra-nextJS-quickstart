"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import PDFViewer from "@/components/chatPage/PDFViewer";
import ChatInterface from "@/components/chatPage/ChatInterface";

interface ToolInvocationResult {
  chunks?: Array<{
    chunkIndex: number;
    text: string;
  }>;
}

interface MessagePart {
  toolInvocation?: {
    result?: ToolInvocationResult;
  };
}

// Define the props interface for clarity
interface PDFUrlProviderProps {
    onPdfUrlChange: (url: string) => void;
}

// Component that only handles search params
const PDFUrlProvider = ({ onPdfUrlChange }: PDFUrlProviderProps) => {
    const searchParams = useSearchParams();
    
    useEffect(() => {
        // Make sure searchParams is ready before using it
        if (searchParams) {
            const fileName = searchParams.get("fileName");
            const pdfUrl = fileName ? `/assets/${fileName}` : "";
            
            // Call the function passed from parent with the new URL
            onPdfUrlChange(pdfUrl);
            console.log("PDFUrlProvider: params processed", { fileName, pdfUrl });
        }
    }, [searchParams, onPdfUrlChange]);

    return null; // This component doesn't render anything
};

const ChatPage = () => {
    const [sourcesForMessages, setSourcesForMessages] = useState<Record<number, { chunkIndex: number; chunkText: string; }[]>>({});
    const [error, setError] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    
    // This function will be called by PDFUrlProvider when URL changes
    const handlePdfUrlChange = (newUrl: string) => {
        console.log("PDF URL changed to:", newUrl); // Optional: for debugging
        setPdfUrl(newUrl);
    };

    const { messages, input, handleInputChange, handleSubmit, status } = useChat({
        api: "/api/chat",
        body: {
            chatId: "chatId",
        },
        onError: (e) => {
            setError(e.message);
        },
        onFinish(message) {
            try {
                // Extract chunk data from message.parts[j].toolInvocation.result.chunks
                const allChunks: { chunkIndex: number; chunkText: string; }[] = [];
                
                if (message.parts && Array.isArray(message.parts)) {
                    (message.parts as MessagePart[]).forEach((part) => {
                        if (part.toolInvocation?.result?.chunks) {
                            const chunks = part.toolInvocation.result.chunks;
                            const chunkData = chunks
                                .filter((chunk) => 
                                    typeof chunk.chunkIndex === 'number' && 
                                    typeof chunk.text === 'string'
                                )
                                .map((chunk) => ({
                                    chunkIndex: chunk.chunkIndex,
                                    chunkText: chunk.text
                                }));
                            allChunks.push(...chunkData);
                        }
                    });
                }
                
                if (allChunks.length > 0) {
                    // Remove duplicates based on chunkIndex
                    const uniqueChunks = allChunks.filter((chunk, index, self) => 
                        index === self.findIndex(c => c.chunkIndex === chunk.chunkIndex)
                    );
                    
                    // Set sources for the current message index
                    const messageIndex = messages.length + 1;
                    setSourcesForMessages(prev => ({
                        ...prev,
                        [messageIndex]: uniqueChunks,
                    }));
                }
            } catch (error) {
                console.error("Error extracting sources from message:", error);
            }
        },
    });

    const handleChunkClick = (chunkIndex: number, chunkText: string) => {
        // You can implement chunk highlighting logic here
        console.log("Clicked chunk index:", chunkIndex);
        console.log("Clicked chunk text:", chunkText);
    };

    return (
        <div className="flex flex-col no-scrollbar -mt-2">
            {/* Use a key to force remounting when page loads */}
            <Suspense fallback={<div>Loading URL parameters...</div>}>
                <PDFUrlProvider 
                    key="pdf-url-provider"
                    onPdfUrlChange={handlePdfUrlChange} 
                />
            </Suspense>
            
            <div className="flex justify-between w-full lg:flex-row flex-col sm:space-y-20 lg:space-y-0 p-2">
                {/* PDF Viewer */}
                {pdfUrl ? (
                    <PDFViewer pdfUrl={pdfUrl} />
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">No PDF selected</p>
                    </div>
                )}
                
                {/* Chat Interface */}
                <ChatInterface
                    messages={messages}
                    status={status}
                    input={input}
                    sourcesForMessages={sourcesForMessages}
                    error={error}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onChunkClick={handleChunkClick}
                />
            </div>
        </div>
    );
};

export default ChatPage;
