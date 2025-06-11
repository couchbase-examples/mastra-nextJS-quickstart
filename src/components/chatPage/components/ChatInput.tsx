import { useRef, useEffect } from "react";
import LoadingDots from "@/components/LoadingDots";

interface ChatInputProps {
    input: string;
    status: string;
    onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent) => void;
    error?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
    input,
    status,
    onInputChange,
    onSubmit,
    error
}) => {
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        textAreaRef.current?.focus();
    }, []);

    // Prevent empty chat submissions
    const handleEnter = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && input.trim()) {
            onSubmit(e as any);
        } else if (e.key === "Enter") {
            e.preventDefault();
        }
    };

    const isDisabled = status === "submitted" || status === "streaming";

    return (
        <div className="flex flex-col">
            <div className="flex justify-center items-center sm:h-[15vh] h-[20vh]">
                <form
                    onSubmit={onSubmit}
                    className="relative w-full px-4 sm:pt-10 pt-2"
                >
                    <textarea
                        className="resize-none p-3 pr-10 rounded-md border border-gray-300 bg-white text-black focus:outline-gray-400 w-full break-words"
                        disabled={isDisabled}
                        value={input}
                        onChange={onInputChange}
                        onKeyDown={handleEnter}
                        ref={textAreaRef}
                        rows={3}
                        autoFocus={false}
                        maxLength={512}
                        id="userInput"
                        name="userInput"
                        placeholder={
                            isDisabled ? "Waiting for response..." : "Ask me anything..."
                        }
                    />
                    <button
                        type="submit"
                        disabled={isDisabled}
                        className="absolute top-[40px] sm:top-[71px] right-6 text-gray-600 bg-transparent py-1 px-2 border-none flex transition duration-300 ease-in-out rounded-sm"
                    >
                        {isDisabled ? (
                            <div className="">
                                <LoadingDots color="#000" style="small" />
                            </div>
                        ) : (
                            <svg
                                viewBox="0 0 20 20"
                                className="transform rotate-90 w-6 h-6 fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                            </svg>
                        )}
                    </button>
                </form>
            </div>
            {error && (
                <div className="border border-red-400 rounded-md p-4 mx-4">
                    <p className="text-red-500">{error}</p>
                </div>
            )}
        </div>
    );
};

export default ChatInput; 