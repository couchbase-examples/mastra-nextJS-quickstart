import Image from "next/image";
import ReactMarkdown from "react-markdown";
import SourcesList from "./components/SourcesList";

interface ChatMessageProps {
    message: {
        role: string;
        content: string;
    };
    index: number;
    sources?: { chunkIndex: number; chunkText: string; }[];
    isLastMessage: boolean;
    previousMessages: boolean;
    isStreaming: boolean;
    onChunkClick?: (chunkIndex: number, chunkText: string) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    index,
    sources,
    isLastMessage,
    previousMessages,
    isStreaming,
    onChunkClick
}) => {
    const getMessageBackgroundClass = () => {
        if (message.role === "assistant") {
            return "bg-gray-100";
        }
        if (isStreaming && isLastMessage) {
            return "animate-pulse bg-white";
        }
        return "bg-white";
    };

    return (
        <div key={`chatMessage-${index}`}>
            <div className={`p-4 text-black animate ${getMessageBackgroundClass()}`}>
                <div className="flex gap-3">
                    <div className="flex-shrink-0">
                        <Image
                            key={index}
                            src={
                                message.role === "assistant"
                                    ? "/images/bot.png"
                                    : "/images/user.svg"
                            }
                            alt="profile image"
                            width={message.role === "assistant" ? "35" : "33"}
                            height="30"
                            className="rounded-sm"
                            priority
                        />
                    </div>
                    <div className="flex-1 min-w-0 prose prose-sm max-w-none break-words overflow-wrap-anywhere text-gray-900 leading-relaxed">
                        <ReactMarkdown 
                            // components={{
                            //     p: ({ children }) => <p className="mb-2 last:mb-0 break-words">{children}</p>,
                            //     ul: ({ children }) => <ul className="list-disc list-inside mb-2 break-words">{children}</ul>,
                            //     ol: ({ children }) => <ol className="list-decimal list-inside mb-2 break-words">{children}</ol>,
                            //     li: ({ children }) => <li className="mb-1 break-words">{children}</li>,
                            //     code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm break-all">{children}</code>,
                            //     pre: ({ children }) => <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto whitespace-pre-wrap break-words">{children}</pre>,
                            //     strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            //     em: ({ children }) => <em className="italic">{children}</em>,
                            // }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Display the chunk indices as sources */}
                {(isLastMessage || previousMessages) && sources && (
                    <SourcesList sources={sources} onChunkClick={onChunkClick} />
                )}
            </div>
        </div>
    );
};

export default ChatMessage; 