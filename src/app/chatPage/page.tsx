"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import PDFViewer from "@/components/chatPage/PDFViewer";
import ChatInterface from "@/components/chatPage/ChatInterface";

const ChatPage = () => {
    const [sourcesForMessages, setSourcesForMessages] = useState<Record<number, { chunkIndex: number; chunkText: string; }[]>>({});
    const [error, setError] = useState("");
    const [pdfUrl, setPdfUrl] = useState("");
    
    const searchParams = useSearchParams();
    
    useEffect(() => {
        setPdfUrl(("/assets/" + searchParams.get("fileName")) as string);
    }, [searchParams]);

    const { messages, input, handleInputChange, handleSubmit, status } = useChat({
        api: "/api/chat",
        body: {
            chatId: "chatId",
        },
        onError: (e) => {
            setError(e.message);
        },
        onFinish(message, options) {
            try {
                // Extract chunk data from message.parts[j].toolInvocation.result.chunks
                let allChunks: { chunkIndex: number; chunkText: string; }[] = [];
                
                if (message.parts && Array.isArray(message.parts)) {
                    message.parts.forEach((part: any) => {
                        if (part.toolInvocation && part.toolInvocation.result && part.toolInvocation.result.chunks) {
                            const chunks = part.toolInvocation.result.chunks;
                            if (Array.isArray(chunks)) {
                                const chunkData = chunks
                                    .filter((chunk: any) => 
                                        typeof chunk.chunkIndex === 'number' && 
                                        typeof chunk.text === 'string'
                                    )
                                    .map((chunk: any) => ({
                                        chunkIndex: chunk.chunkIndex,
                                        chunkText: chunk.text
                                    }));
                                allChunks.push(...chunkData);
                            }
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
            <div className="flex justify-between w-full lg:flex-row flex-col sm:space-y-20 lg:space-y-0 p-2">
                {/* PDF Viewer */}
                <PDFViewer pdfUrl={pdfUrl} />
                
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
