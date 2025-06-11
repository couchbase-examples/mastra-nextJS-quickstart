import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";

interface ChatInterfaceProps {
    messages: Array<{
        role: string;
        content: string;
    }>;
    status: string;
    input: string;
    sourcesForMessages: Record<number, { chunkIndex: number; chunkText: string; }[]>;
    error: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    onChunkClick?: (chunkIndex: number, chunkText: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
    messages,
    status,
    input,
    sourcesForMessages,
    error,
    onInputChange,
    onSubmit,
    onChunkClick
}) => {
    return (
        <div className="flex flex-col w-full justify-between align-center h-[90vh] no-scrollbar">
            <MessageList
                messages={messages}
                status={status}
                sourcesForMessages={sourcesForMessages}
                onChunkClick={onChunkClick}
            />
            <ChatInput
                input={input}
                status={status}
                onInputChange={onInputChange}
                onSubmit={onSubmit}
                error={error}
            />
        </div>
    );
};

export default ChatInterface; 