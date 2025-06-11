interface SourcesListProps {
    sources: { chunkIndex: number; chunkText: string; }[];
    onChunkClick?: (chunkIndex: number, chunkText: string) => void;
}

const SourcesList: React.FC<SourcesListProps> = ({ sources, onChunkClick }) => {
    const handleChunkClick = (chunkIndex: number, chunkText: string) => {
        if (onChunkClick) {
            onChunkClick(chunkIndex, chunkText);
        } else {
            // Default behavior: log the chunk index and text
            console.log("Clicked chunk index:", chunkIndex);
            console.log("Clicked chunk text:", chunkText);
        }
    };

    console.log("sources", sources);

    return (
        <div className="flex flex-wrap gap-2 ml-14 mt-3">
            <span className="text-sm text-gray-600 mr-2">Sources:</span>
            {sources.map((source, idx: number) => (
                <button
                    key={`chunk-${source.chunkIndex}-${idx}`}
                    className="border bg-blue-100 px-2 py-1 hover:bg-blue-200 transition rounded text-sm"
                    onClick={() => handleChunkClick(source.chunkIndex, source.chunkText)}
                    title={`Chunk ${source.chunkIndex}: ${source.chunkText.substring(0, 100)}${source.chunkText.length > 100 ? '...' : ''}`}
                >
                    #{source.chunkIndex}
                </button>
            ))}
        </div>
    );
};

export default SourcesList; 