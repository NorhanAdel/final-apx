type MessageCardProps = {
  name: string;
  role: string;
  content: string;
  date: string;
  showButtons?: boolean;
};

export const MessageCard = ({
  name,
  role,
  content,
  date,
  showButtons = true,
}: MessageCardProps) => {
  return (
    <div className="bg-[#0a1227] border border-[#1e293b] p-5 rounded-lg relative">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full border border-gray-600 bg-gray-800" />
          <div>
            <h3 className="font-bold text-lg leading-tight">{name}</h3>
            <p className="text-[#facc15] text-xs font-semibold uppercase">
              {role}
            </p>
          </div>
        </div>

        {showButtons && (
          <div className="flex gap-2">
            <button className="px-4 py-1 text-red-600 border border-red-900 rounded-md text-sm font-bold hover:bg-red-900/20">
              Reject
            </button>
            <button className="px-4 py-1 bg-[#064e3b] text-green-400 border border-green-800 rounded-md text-sm font-bold hover:bg-[#065f46]">
              Accept
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-300 text-sm leading-relaxed italic mt-3">
        {content}
      </p>

      <div className="text-right text-[10px] text-gray-500 mt-2 italic">
        {date}
      </div>
    </div>
  );
};