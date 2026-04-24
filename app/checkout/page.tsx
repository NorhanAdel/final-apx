"use client";

import { CreditCard, Plus, ChevronDown, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import React from "react";

interface Card {
  id: number;
  lastFour: string;
  expiry: string;
  type: string;
}

interface NewCardData {
  number: string;
  expiry: string;
}

export default function CheckoutPage() {
  const [cards, setCards] = useState<Card[]>([
    { id: 1, lastFour: "0981", expiry: "10/28", type: "/pay1.png" },
    { id: 2, lastFour: "2564", expiry: "10/28", type: "/pay.png" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [newCardData, setNewCardData] = useState<NewCardData>({ number: "", expiry: "" });

  const handleAddCard = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newCardData.number || !newCardData.expiry) return;

    const newCard: Card = {
      id: Date.now(),
      lastFour: newCardData.number.slice(-4),
      expiry: newCardData.expiry,
      type: "/pay1.png",
    };

    setCards([...cards, newCard]);
    setIsModalOpen(false);
    setNewCardData({ number: "", expiry: "" });
  };

  const handlePayment = () => {
    setIsPaid(true);
  };

  return (
    <div className="min-h-screen text-white bg-[#020617] py-38 flex justify-center items-start px-10 relative overflow-hidden font-sans">
      <div className="absolute w-[800px] h-[800px] bg-blue-900/20 blur-[150px] rounded-full -left-40 -top-40 pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] bg-blue-800/10 blur-[120px] rounded-full -right-20 -bottom-20 pointer-events-none" />

      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
        <div className="lg:col-span-2">
          <h1 className="text-3xl font-black italic text-[#FFD700] mb-8 uppercase tracking-wider">
            Express Checkout
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
            <button className="h-12 rounded-lg bg-[#5A31F4] font-bold text-white uppercase italic">shop pay</button>
            <button className="h-12 rounded-lg bg-white font-bold text-black uppercase italic">Google Pay</button>
            <button className="h-12 rounded-lg bg-[#FF9900] font-bold text-black uppercase italic">amazon pay</button>
            <button className="h-12 rounded-lg bg-[#0070BA] font-bold text-white uppercase italic">PayPal</button>
          </div>

          <h2 className="text-[#FFD700] mb-6 font-bold text-xl italic uppercase">Shipping Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
            <div className="relative col-span-full">
              <select className="w-full bg-[#0F172A]/80 border border-gray-700 rounded-lg p-4 outline-none appearance-none focus:border-[#FFD700] transition italic font-bold text-yellow-500">
                <option>Nepal</option>
                <option>Egypt</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-500" size={20} />
            </div>
            <input className="bg-[#0F172A]/80 border border-gray-700 rounded-lg p-4 outline-none focus:border-[#FFD700] transition italic" placeholder="First Name" />
            <input className="bg-[#0F172A]/80 border border-gray-700 rounded-lg p-4 outline-none focus:border-[#FFD700] transition italic" placeholder="Last Name" />
            <input className="col-span-full bg-[#0F172A]/80 border border-gray-700 rounded-lg p-4 outline-none focus:border-[#FFD700] transition italic" placeholder="Address" />
            <input className="col-span-full bg-[#0F172A]/80 border border-gray-700 rounded-lg p-4 outline-none focus:border-[#FFD700] transition italic" placeholder="Phone" />
          </div>

          <h2 className="text-[#FFD700] mb-6 font-bold text-xl italic uppercase">Payment Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {cards.map((card) => (
              <div key={card.id} className="relative p-6 rounded-xl bg-[#0F172A] border border-[#FFD700]/30 hover:border-[#FFD700] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                  <Image src={card.type} alt="card type" width={50} height={30} />
                </div>
                <div className="text-xl tracking-[0.2em] font-mono mb-4 italic">**** **** **** {card.lastFour}</div>
                <div className="text-xs text-gray-400 uppercase italic">Expires {card.expiry}</div>
              </div>
            ))}

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-gray-700 hover:border-[#FFD700]/50 transition-all group"
            >
              <div className="w-10 h-10 rounded-full border border-gray-500 flex items-center justify-center mb-2 group-hover:border-[#FFD700]">
                <Plus size={24} className="group-hover:text-[#FFD700]" />
              </div>
              <span className="text-sm font-bold uppercase italic group-hover:text-[#FFD700]">Add New Card</span>
            </button>
          </div>

          <button 
            onClick={handlePayment}
            className="w-full py-5 rounded-lg bg-[#001540] border border-[#FFD700] text-white text-2xl font-black italic uppercase tracking-widest shadow-[0_0_15px_rgba(255,215,0,0.2)] hover:bg-[#001d5a] transition-colors"
          >
            Pay Now
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-10 p-8 rounded-[2rem] bg-[#000a21] border-2 border-[#1e293b] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-yellow-600 rounded-tl-2xl"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-yellow-600 rounded-tr-2xl"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-yellow-600 rounded-bl-2xl"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-yellow-600 rounded-br-2xl"></div>

            <h3 className="text-2xl font-black italic uppercase mb-10 tracking-tighter border-b-2 border-dotted border-gray-800 pb-4 text-center">
              Order Summary
            </h3>

            <div className="space-y-8 mb-10">
              <div className="flex justify-between items-baseline">
                <span className="text-[#FFD700] font-black italic uppercase text-xs tracking-tight">
                  Total products <span className="text-[10px] text-gray-500 lowercase font-normal">(including tax)</span>
                </span>
                <span className="text-[#FFD700] font-black text-xl italic tracking-tighter">₹ 120</span>
              </div>

              <div className="flex border-2 border-[#FFD700] rounded-full overflow-hidden bg-transparent h-12">
                <input
                  className="flex-1 bg-transparent px-6 outline-none text-sm italic font-bold placeholder:text-gray-600"
                  placeholder="Discount Code"
                />
                <button className="bg-[#001540] px-8 border-l-2 border-[#FFD700] text-[#FFD700] font-black italic uppercase text-sm hover:bg-yellow-500 hover:text-black transition-colors">
                  Apply
                </button>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t-2 border-dotted border-gray-800">
                <span className="text-[#FFD700] font-black italic uppercase text-xl">Total</span>
                <span className="text-[#FFD700] font-black text-2xl italic tracking-tighter">₹ 120</span>
              </div>
            </div>

            <button 
              onClick={handlePayment}
              className="w-full py-4 rounded-xl bg-[#001540] border-2 border-yellow-700/50 text-white font-black italic uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-lg"
            >
              Payment
            </button>
          </div>
        </div>
      </div>

      {isPaid && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="bg-[#0F172A] border-2 border-[#FFD700] rounded-[2rem] p-10 flex flex-col items-center max-w-sm w-full text-center relative animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 size={50} className="text-green-500" />
            </div>
            <h2 className="text-[#FFD700] text-3xl font-black italic uppercase mb-2">Success!</h2>
            <p className="text-gray-300 font-bold italic mb-8 uppercase tracking-widest text-sm">تم الدفع بنجاح</p>
            <button 
              onClick={() => setIsPaid(false)}
              className="w-full py-3 bg-[#FFD700] text-black font-black italic uppercase rounded-lg hover:bg-yellow-500 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F172A] border border-[#FFD700] w-full max-w-md rounded-2xl p-8 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <h2 className="text-[#FFD700] text-xl font-bold italic uppercase mb-6">Add New Card</h2>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-2 italic">Card Number</label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  placeholder="0000 0000 0000 0000"
                  className="w-full bg-[#020617] border border-gray-700 rounded-lg p-3 outline-none focus:border-[#FFD700] italic text-white"
                  onChange={(e) => setNewCardData({ ...newCardData, number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs uppercase font-bold text-gray-400 mb-2 italic">Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  required
                  className="w-full bg-[#020617] border border-gray-700 rounded-lg p-3 outline-none focus:border-[#FFD700] italic text-white"
                  onChange={(e) => setNewCardData({ ...newCardData, expiry: e.target.value })}
                />
              </div>
              <button type="submit" className="w-full py-3 bg-[#FFD700] text-black font-bold uppercase rounded-lg mt-4 hover:bg-yellow-500 transition italic">
                Save Card
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}