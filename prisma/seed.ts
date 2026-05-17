import "dotenv/config";
import { PrismaClient, QuestCategory, Difficulty, Rarity } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Quest Templates ──────────────────────────────────────────────────────

  const templates = [
    // FITNESS
    {
      title: "Complete 100 Push-ups",
      description: "Do 100 push-ups throughout the day. Sets allowed.",
      category: QuestCategory.FITNESS,
      difficulty: Difficulty.HARD,
      xpReward: 80,
      statRewards: { STRENGTH: 20, STAMINA: 10 },
    },
    {
      title: "Run 2 Miles",
      description: "Complete a 2-mile run at any pace.",
      category: QuestCategory.FITNESS,
      difficulty: Difficulty.NORMAL,
      xpReward: 60,
      statRewards: { STAMINA: 20, AGILITY: 10, DISCIPLINE: 5 },
    },
    {
      title: "Go to the Gym",
      description: "Complete a full gym session (minimum 45 minutes).",
      category: QuestCategory.FITNESS,
      difficulty: Difficulty.NORMAL,
      xpReward: 70,
      statRewards: { STRENGTH: 15, STAMINA: 15, DISCIPLINE: 5 },
    },
    {
      title: "Complete 200 Squats",
      description: "200 body-weight squats. Split into sets as needed.",
      category: QuestCategory.FITNESS,
      difficulty: Difficulty.HARD,
      xpReward: 75,
      statRewards: { STRENGTH: 15, AGILITY: 15, STAMINA: 10 },
    },
    {
      title: "10-Minute Morning Stretch",
      description: "Start your day with a 10-minute full-body stretch.",
      category: QuestCategory.FITNESS,
      difficulty: Difficulty.EASY,
      xpReward: 30,
      statRewards: { AGILITY: 15, DISCIPLINE: 10 },
    },

    // MIND
    {
      title: "Meditate for 15 Minutes",
      description: "Complete a focused mindfulness meditation session.",
      category: QuestCategory.MIND,
      difficulty: Difficulty.NORMAL,
      xpReward: 50,
      statRewards: { DISCIPLINE: 20, INTELLIGENCE: 10 },
    },
    {
      title: "Journal Entry",
      description: "Write a journal entry reflecting on your day or goals.",
      category: QuestCategory.MIND,
      difficulty: Difficulty.EASY,
      xpReward: 35,
      statRewards: { DISCIPLINE: 10, CREATIVITY: 10, INTELLIGENCE: 5 },
    },

    // HEALTH
    {
      title: "Sleep 8 Hours",
      description: "Get a full 8 hours of quality sleep.",
      category: QuestCategory.HEALTH,
      difficulty: Difficulty.NORMAL,
      xpReward: 55,
      statRewards: { STAMINA: 20, DISCIPLINE: 10 },
    },
    {
      title: "Drink 2L of Water",
      description: "Stay hydrated. Drink at least 2 liters of water today.",
      category: QuestCategory.HEALTH,
      difficulty: Difficulty.EASY,
      xpReward: 25,
      statRewards: { STAMINA: 15, DISCIPLINE: 5 },
    },
    {
      title: "Eat a Healthy Meal",
      description: "Prepare and eat a nutritious, whole-food meal.",
      category: QuestCategory.HEALTH,
      difficulty: Difficulty.EASY,
      xpReward: 30,
      statRewards: { STAMINA: 10, DISCIPLINE: 10, INTELLIGENCE: 5 },
    },

    // LEARNING
    {
      title: "Read 20 Pages",
      description: "Read 20 pages of a book (non-fiction preferred).",
      category: QuestCategory.LEARNING,
      difficulty: Difficulty.EASY,
      xpReward: 40,
      statRewards: { INTELLIGENCE: 20, DISCIPLINE: 5 },
    },
    {
      title: "Study for 1 Hour",
      description: "Deep focus study session — no distractions for 60 minutes.",
      category: QuestCategory.LEARNING,
      difficulty: Difficulty.NORMAL,
      xpReward: 65,
      statRewards: { INTELLIGENCE: 25, DISCIPLINE: 15 },
    },
    {
      title: "Learn Something New",
      description: "Watch an educational video or read an article in a new subject.",
      category: QuestCategory.LEARNING,
      difficulty: Difficulty.EASY,
      xpReward: 35,
      statRewards: { INTELLIGENCE: 15, CREATIVITY: 5 },
    },

    // CREATIVITY
    {
      title: "Create Something",
      description: "Spend 30+ minutes on a creative project (art, music, writing, code).",
      category: QuestCategory.CREATIVITY,
      difficulty: Difficulty.NORMAL,
      xpReward: 55,
      statRewards: { CREATIVITY: 25, INTELLIGENCE: 10 },
    },
    {
      title: "Practice an Instrument",
      description: "Practice your instrument or learn a new song for 20+ minutes.",
      category: QuestCategory.CREATIVITY,
      difficulty: Difficulty.NORMAL,
      xpReward: 50,
      statRewards: { CREATIVITY: 20, DISCIPLINE: 10, AGILITY: 5 },
    },

    // SOCIAL
    {
      title: "Meaningful Conversation",
      description: "Have a meaningful, focused conversation with someone.",
      category: QuestCategory.SOCIAL,
      difficulty: Difficulty.EASY,
      xpReward: 35,
      statRewards: { CHARISMA: 20, INTELLIGENCE: 5 },
    },
    {
      title: "Help Someone",
      description: "Do something helpful for a friend, family member, or colleague.",
      category: QuestCategory.SOCIAL,
      difficulty: Difficulty.EASY,
      xpReward: 40,
      statRewards: { CHARISMA: 20, DISCIPLINE: 5 },
    },

    // DISCIPLINE
    {
      title: "No Phone First Hour",
      description: "Don't check your phone for the first hour after waking up.",
      category: QuestCategory.DISCIPLINE,
      difficulty: Difficulty.HARD,
      xpReward: 60,
      statRewards: { DISCIPLINE: 30, INTELLIGENCE: 10 },
    },
    {
      title: "Complete Your To-Do List",
      description: "Finish everything on today's task list without procrastination.",
      category: QuestCategory.DISCIPLINE,
      difficulty: Difficulty.HARD,
      xpReward: 70,
      statRewards: { DISCIPLINE: 30, INTELLIGENCE: 10 },
    },
    {
      title: "Cold Shower",
      description: "Take a cold shower for at least 2 minutes.",
      category: QuestCategory.DISCIPLINE,
      difficulty: Difficulty.HARD,
      xpReward: 65,
      statRewards: { DISCIPLINE: 30, STAMINA: 10, AGILITY: 5 },
    },
  ];

  for (const t of templates) {
    await prisma.questTemplate.upsert({
      where: { id: `system-${t.title.toLowerCase().replace(/\s+/g, "-")}` },
      create: { id: `system-${t.title.toLowerCase().replace(/\s+/g, "-")}`, ...t },
      update: t,
    });
  }

  console.log(`✅ Created ${templates.length} quest templates`);

  // ─── Achievements ─────────────────────────────────────────────────────────

  const achievements = [
    { key: "first_quest", title: "First Steps", description: "Complete your first quest.", xpReward: 50, rarity: Rarity.COMMON },
    { key: "streak_3", title: "Getting Started", description: "Maintain a 3-day streak.", xpReward: 75, rarity: Rarity.COMMON },
    { key: "streak_7", title: "Week Warrior", description: "Maintain a 7-day streak.", xpReward: 150, rarity: Rarity.UNCOMMON },
    { key: "streak_14", title: "Fortnight Hunter", description: "Maintain a 14-day streak.", xpReward: 300, rarity: Rarity.RARE },
    { key: "streak_30", title: "Unstoppable", description: "Maintain a 30-day streak.", xpReward: 750, rarity: Rarity.EPIC },
    { key: "streak_100", title: "Shadow Monarch", description: "Maintain a 100-day streak.", xpReward: 5000, rarity: Rarity.LEGENDARY },
    { key: "xp_1000", title: "Rising Hunter", description: "Earn 1,000 total XP.", xpReward: 100, rarity: Rarity.COMMON },
    { key: "xp_10000", title: "Veteran Hunter", description: "Earn 10,000 total XP.", xpReward: 500, rarity: Rarity.UNCOMMON },
    { key: "xp_100000", title: "Elite Hunter", description: "Earn 100,000 total XP.", xpReward: 2000, rarity: Rarity.RARE },
    { key: "level_10", title: "Awakened", description: "Reach Level 10.", xpReward: 200, rarity: Rarity.UNCOMMON },
    { key: "level_25", title: "Proven Warrior", description: "Reach Level 25.", xpReward: 500, rarity: Rarity.RARE },
    { key: "level_50", title: "Elite Rank", description: "Reach Level 50.", xpReward: 1500, rarity: Rarity.EPIC },
    { key: "rank_d", title: "D Rank", description: "Ascend to D Rank.", xpReward: 100, rarity: Rarity.COMMON },
    { key: "rank_c", title: "C Rank", description: "Ascend to C Rank.", xpReward: 250, rarity: Rarity.UNCOMMON },
    { key: "rank_b", title: "B Rank", description: "Ascend to B Rank.", xpReward: 500, rarity: Rarity.RARE },
    { key: "rank_a", title: "A Rank", description: "Ascend to A Rank.", xpReward: 1000, rarity: Rarity.EPIC },
    { key: "rank_s", title: "S Rank — Monarch", description: "Ascend to S Rank.", xpReward: 5000, rarity: Rarity.LEGENDARY },
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { key: ach.key },
      create: ach,
      update: ach,
    });
  }

  console.log(`✅ Created ${achievements.length} achievements`);
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
