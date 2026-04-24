import { MessageCard } from "./MessageCard";

export default function InboxList() {
  const messages = [
    {
      id: 1,
      name: "Ronald Richards",
      role: "Agent",
      content: "I have been following your performances and I am truly impressed by your talent...",
      date: "24, Aug 2026"
    },
    {
      id: 2,
      name: "Ronald Richards",
      role: "Scout",
      content: "I recently discovered you as a talented player... I would like to recommend you for Real Madrid.",
      date: "24, Aug 2026"
    }
  ];

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg) => (
        <MessageCard key={msg.id} {...msg} />
      ))}
    </div>
  );
}