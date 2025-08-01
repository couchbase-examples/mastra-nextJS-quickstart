import { useRef } from "react";
import Image from "next/image";
import ChatMessage from "./components/ChatMessage";

interface MessageListProps {
    messages: Array<{
        role: string;
        content: string;
    }>;
    status: string;
    sourcesForMessages: Record<number, { chunkIndex: number; chunkText: string; }[]>;
    onChunkClick?: (chunkIndex: number, chunkText: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
    messages,
    status,
}) => {
    const messageListRef = useRef<HTMLDivElement>(null);

    return (
        <div className="w-full min-h-min bg-white border flex justify-center items-center no-scrollbar sm:h-[85vh] h-[80vh]">
            <div
                ref={messageListRef}
                className="w-full h-full overflow-y-scroll no-scrollbar rounded-md mt-4"
            >
                {messages.length === 0 ? (
                    <div className="flex justify-center h-full items-center text-xl">
                        Ask your first question below!
                    </div>
                ) : null}

                {messages.map((message, index) => {
                    const isLastMessage = status === "ready" && index === messages.length - 1;
                    const isStreaming = (status === "submitted" || status === "streaming") && index === messages.length - 1;

                    return (
                        <ChatMessage
                            key={`chatMessage-${index}`}
                            message={message}
                            index={index}
                            isLastMessage={isLastMessage}
                            isStreaming={isStreaming}
                        />
                    );
                })}

                {/* Show "Thinking..." indicator when AI is processing but hasn't started streaming yet */}
                {(status === "submitted" || status === "streaming" )? (
                    <div className="p-4 text-black bg-gray-100 animate-pulse">
                        <div className="flex gap-3">
                            <div className="flex-shrink-0">
                                <Image
                                    src="/images/bot.png"
                                    alt="profile image"
                                    width="35"
                                    height="30"
                                    className="rounded-sm"
                                    priority
                                />
                            </div>
                            <div className="flex-1 min-w-0 prose prose-sm max-w-none break-words overflow-wrap-anywhere text-gray-600 leading-relaxed">
                                <p className="mb-0 italic">Thinking...</p>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default MessageList; 