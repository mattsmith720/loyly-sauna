import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Löyly Ritual | LÖYLY CO.",
  description:
    "A cozy first-person sauna ritual. Heat the stones, throw löyly, sit through the round.",
};

export default function PlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="game-shell fixed inset-0 z-[200] h-dvh w-full overflow-hidden bg-[#1a1613]">
      {children}
    </div>
  );
}
