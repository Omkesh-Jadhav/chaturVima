import { motion } from "framer-motion";
import { CalendarCheck, CalendarClock, Share2 } from "lucide-react";

interface CycleActionCardsProps {
  onCreate: () => void;
  onQuickSchedule: () => void;
  onShare: () => void;
}

const cards = [
  {
    id: "create",
    title: "Create Assessment Cycle",
    description:
      "Spin up a fresh performance or engagement cycle with curated templates and guardrails.",
    icon: CalendarCheck,
    accent: "from-brand-teal to-brand-navy",
  },
  {
    id: "schedule",
    title: "Schedule & Automate",
    description:
      "Map the cadence, reminders, and blackout windows for each team in one planner.",
    icon: CalendarClock,
    accent: "from-purple-500 to-indigo-500",
  },
  {
    id: "share",
    title: "Share with Department Heads",
    description:
      "Grant controlled scheduling access to department heads without exposing creation rights.",
    icon: Share2,
    accent: "from-amber-500 to-orange-500",
  },
];

const CycleActionCards = ({
  onCreate,
  onQuickSchedule,
  onShare,
}: CycleActionCardsProps) => {
  const handlers: Record<string, () => void> = {
    create: onCreate,
    schedule: onQuickSchedule,
    share: onShare,
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.button
            key={card.id}
            onClick={handlers[card.id]}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-linear-to-r ${card.accent}`}
            />
            <div className="flex items-center gap-3">
              <div
                className={`rounded-2xl bg-linear-to-br ${card.accent} p-3 text-white shadow-lg`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {card.title}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default CycleActionCards;
