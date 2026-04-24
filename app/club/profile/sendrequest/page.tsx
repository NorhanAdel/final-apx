"use client";
import { useState, ChangeEvent } from "react";

type Player = {
  id: number;
  name: string;
  pos: string;
  rating: number;
  price: string;
  img: string;
};

export default function SendRequestPage() {
  const [isOpen, setIsOpen] = useState(false);  
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);  
  const [formData, setFormData] = useState({ title: "", details: "" });

  const players: Player[] = [
    { id: 1, name: "Ronaldo", pos: "Forward", rating: 4, price: "24M", img: "https://via.placeholder.com/50" },
    { id: 2, name: "Messi", pos: "Forward", rating: 5, price: "30M", img: "https://via.placeholder.com/50" },
    { id: 3, name: "Neymar", pos: "Forward", rating: 4, price: "18M", img: "https://via.placeholder.com/50" },
  ];

  // التعديل هنا: تحديد نوع player
  const handleSelect = (player: Player) => {
    setSelectedPlayer(player);
    setIsOpen(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: "title" | "details") => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-[#050a18] text-white p-6 font-sans">
      <div className="max-w-5xl mx-auto py-35">
        <h1 className="text-center text-[#facc15] text-3xl font-black italic uppercase mb-8">
          Sent Request
        </h1>

        <div className="space-y-6">
          <section className="relative">
            <label className="block text-lg font-bold mb-2 uppercase italic text-gray-300">Player</label>
            <div 
              onClick={() => setIsOpen(!isOpen)}
              className="bg-[#0a1227] border border-[#1e293b] rounded-lg p-3 flex justify-between items-center cursor-pointer hover:border-gray-500 transition-all"
            >
              <div className="flex items-center gap-2">
                <span className="text-[#facc15]">⚽</span>
                <span className={selectedPlayer ? "text-white font-bold" : "text-gray-500"}>
                  {selectedPlayer ? selectedPlayer.name : "Select Player"}
                </span>
              </div>
              <span className={`text-[#facc15] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </div>

            {isOpen && (
              <div className="absolute z-50 w-full mt-2 bg-[#0d1731] border border-[#1e293b] rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                <div className="divide-y divide-[#1e293b]">
                  {players.map((player) => (
                    <div 
                      key={player.id} 
                      onClick={() => handleSelect(player)}
                      className="flex items-center p-3 gap-4 cursor-pointer hover:bg-[#1a2b53] transition-colors"
                    >
                      <img src={player.img} alt={player.name} className="w-10 h-10 rounded border border-gray-700" />
                      <div className="flex-1">
                        <h4 className="font-bold italic">{player.name}</h4>
                        <p className="text-[10px] text-gray-400">⚽ {player.pos}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-[#facc15] text-xs">{"⭐".repeat(player.rating)}</div>
                        <div className="text-[10px] text-gray-500 italic">💰 {player.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section>
            <label className="block text-lg font-bold mb-2 uppercase italic text-gray-300">Title</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#facc15]">📁</span>
              <input 
                type="text" 
                placeholder="Title Of Request"
                className="w-full bg-[#0a1227] border border-[#1e293b] rounded-lg py-4 pl-12 pr-4 text-sm italic focus:outline-none focus:border-[#facc15] placeholder:text-gray-700 transition-all"
                value={formData.title}
                onChange={(e) => handleInputChange(e, "title")}
              />
            </div>
          </section>

          <section>
            <label className="block text-lg font-bold mb-2 uppercase italic text-gray-300">Details</label>
            <textarea 
              rows={5}
              placeholder="Details of Request"
              className="w-full bg-[#0a1227] border border-[#1e293b] rounded-lg p-4 text-sm italic focus:outline-none focus:border-[#facc15] placeholder:text-gray-700 resize-none transition-all"
              value={formData.details}
              onChange={(e) => handleInputChange(e, "details")}
            />
          </section>

          <button 
            disabled={!selectedPlayer}
            className={`w-full py-4 rounded-md  border-x-2 border-yellow-500 flex items-center justify-center gap-2 transition-all text-xl font-black italic uppercase shadow-xl
              ${selectedPlayer ? 'bg-[#0f172a] hover:bg-blue-900 cursor-pointer' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
            `}
          >
            Sent Request 
            <span className={selectedPlayer ? "text-[#facc15]" : "grayscale"}>📩</span>
          </button>
        </div>
      </div>
    </div>
  );
}