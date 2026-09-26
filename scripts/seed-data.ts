import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import type { Client, InStatement } from "@libsql/client";
import { serializeModes, type Mode } from "../src/lib/modes";
import { synthesizeEvents } from "../src/lib/event-synthesis";

type Difficulty = "easy" | "medium" | "hard";

interface ScenarioSeed {
  category: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  modes: Mode[];
  passScore: number;
  excellentScore: number;
  maxErrors: number | null;
  timeLimitS: number | null;
}

const SCENARIOS: ScenarioSeed[] = [
  {
    category: "Vascular Access",
    title: "Central Venous Catheterization (CVC)",
    description:
      "Ultrasound-guided central line placement via the internal jugular approach, covering sterile technique, needle guidance, guidewire (Seldinger technique) insertion, and catheter confirmation.",
    difficulty: "hard",
    modes: ["guided", "practice", "exam"],
    passScore: 70,
    excellentScore: 90,
    maxErrors: 2,
    timeLimitS: 240,
  },
  {
    category: "Obstetric Procedures",
    title: "Amniocentesis",
    description:
      "Ultrasound-guided transabdominal amniocentesis, covering needle path planning around the fetus and placenta, aseptic technique, and amniotic fluid aspiration.",
    difficulty: "medium",
    // Deliberately excludes 'exam' to show a scenario that can be restricted to lower-stakes modes.
    modes: ["guided", "practice"],
    passScore: 65,
    excellentScore: 85,
    maxErrors: 3,
    timeLimitS: 260,
  },
  {
    category: "Urinary Procedures",
    title: "Foley Catheter Insertion",
    description:
      "Sterile insertion of an indwelling urinary catheter, covering aseptic technique, anatomical landmarking, balloon inflation, and securement.",
    difficulty: "easy",
    modes: ["guided", "practice", "exam"],
    // No hard caps on this one — grading is purely score-band based, to show that
    // critical-error caps are optional per scenario rather than always required.
    passScore: 60,
    excellentScore: 85,
    maxErrors: null,
    timeLimitS: null,
  },
];

export async function seed(db: Client, force = false): Promise<void> {
  const statements: InStatement[] = [];

  if (force) {
    statements.push(
      "DELETE FROM attempt_events",
      "DELETE FROM attempts",
      "DELETE FROM scenarios",
      "DELETE FROM user_settings",
      "DELETE FROM sessions",
      "DELETE FROM users"
    );
  }

  const teacherId = crypto.randomUUID();
  statements.push({
    sql: `INSERT INTO users (id, username, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)`,
    args: [teacherId, "teacher", bcrypt.hashSync("teacher123", 10), "teacher", "Dr. Chen (Teacher)"],
  });

  const studentIds: string[] = [];
  for (let i = 1; i <= 3; i++) {
    const id = crypto.randomUUID();
    studentIds.push(id);
    statements.push({
      sql: `INSERT INTO users (id, username, password_hash, role, display_name) VALUES (?, ?, ?, ?, ?)`,
      args: [id, `student${i}`, bcrypt.hashSync("student123", 10), "student", `Student ${i}`],
    });
  }

  const scenarioIds: string[] = [];
  for (const s of SCENARIOS) {
    const id = crypto.randomUUID();
    scenarioIds.push(id);
    statements.push({
      sql: `INSERT INTO scenarios
        (id, category, title, description, difficulty, available_modes, pass_score, excellent_score, max_errors, time_limit_s)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        s.category,
        s.title,
        s.description,
        s.difficulty,
        serializeModes(s.modes),
        s.passScore,
        s.excellentScore,
        s.maxErrors,
        s.timeLimitS,
      ],
    });
  }

  function addCompletedAttempt(
    userId: string,
    scenario: ScenarioSeed,
    scenarioId: string,
    mode: Mode,
    daysAgo: number,
    score: number,
    timeSeconds: number,
    errors: number
  ) {
    const attemptId = crypto.randomUUID();
    statements.push({
      sql: `INSERT INTO attempts (id, user_id, scenario_id, status, mode, score, metrics_json, started_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?), ?)`,
      args: [
        attemptId,
        userId,
        scenarioId,
        "completed",
        mode,
        score,
        JSON.stringify({ time_s: timeSeconds, errors }),
        `-${daysAgo} days`,
        new Date(Date.now() - daysAgo * 86400000 + timeSeconds * 1000).toISOString(),
      ],
    });
    synthesizeEvents({ category: scenario.category, mode, timeSeconds, errors, score }).forEach(
      (event, i) => {
        statements.push({
          sql: `INSERT INTO attempt_events (id, attempt_id, seq, t_offset_s, type, label, points)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [crypto.randomUUID(), attemptId, i, event.tOffsetS, event.type, event.label, event.points],
        });
      }
    );
  }

  // Give each student a growing history (more attempts, generally improving scores) spread
  // across the past few weeks, across every scenario and mode, so every report view
  // (trend charts, mode breakdowns, per-unit averages, training history, grading) has
  // real, varied content out of the box.
  studentIds.forEach((studentId, studentIndex) => {
    SCENARIOS.forEach((scenario, scenarioIndex) => {
      const scenarioId = scenarioIds[scenarioIndex];
      const attemptCount = 2 + studentIndex;
      for (let i = 0; i < attemptCount; i++) {
        const mode = scenario.modes[i % scenario.modes.length];
        const daysAgo = (attemptCount - i) * 3 + studentIndex * 2;
        const baseScore = 65 + studentIndex * 5 + i * 4;
        const score = Math.min(100, Math.max(50, baseScore + Math.round(Math.random() * 10 - 5)));
        const errors = Math.max(0, 3 - i - studentIndex + Math.round(Math.random()));
        const timeSeconds = 90 + errors * 20 + Math.round(Math.random() * 40);
        addCompletedAttempt(studentId, scenario, scenarioId, mode, daysAgo, score, timeSeconds, errors);
      }
    });
  });

  // One in-progress attempt so the "resume simulation" path also has sample data.
  statements.push({
    sql: `INSERT INTO attempts (id, user_id, scenario_id, status, mode, score, metrics_json, started_at, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', ?), ?)`,
    args: [crypto.randomUUID(), studentIds[2], scenarioIds[1], "in_progress", "practice", null, null, "-1 hours", null],
  });

  await db.batch(statements, "write");
}
