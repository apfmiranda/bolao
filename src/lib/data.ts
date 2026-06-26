import { promises as fs } from "fs";
import path from "path";
import type {
  ParticipantsData,
  GamesData,
  PredictionsData,
  DraftOrderData,
} from "./types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const TEMPLATE_DIR = process.env.TEMPLATE_DIR || path.join(process.cwd(), "data-template");

function filePath(name: string): string {
  return path.join(DATA_DIR, name);
}

let isInitialized = false;

async function ensureInitialized(): Promise<void> {
  if (isInitialized) return;

  // Garantir que a pasta DATA_DIR existe
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // Pasta já existe ou erro na criação
  }

  const files = [
    "games.json",
    "participants.json",
    "predictions.json",
    "draftOrders.json",
  ];

  for (const file of files) {
    const destPath = filePath(file);
    try {
      await fs.access(destPath);
    } catch {
      // Arquivo não existe no destino, copia do template
      const srcPath = path.join(TEMPLATE_DIR, file);
      try {
        const content = await fs.readFile(srcPath, "utf-8");
        await fs.writeFile(destPath, content, "utf-8");
        console.log(`[Database Initialization] Created ${file} from template.`);
      } catch (copyErr) {
        console.error(`[Database Error] Failed to copy template for ${file}:`, copyErr);
      }
    }
  }

  isInitialized = true;
}

export async function readParticipants(): Promise<ParticipantsData> {
  await ensureInitialized();
  const raw = await fs.readFile(filePath("participants.json"), "utf-8");
  return JSON.parse(raw) as ParticipantsData;
}

export async function writeParticipants(data: ParticipantsData): Promise<void> {
  await ensureInitialized();
  await fs.writeFile(
    filePath("participants.json"),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

export async function readGames(): Promise<GamesData> {
  await ensureInitialized();
  const raw = await fs.readFile(filePath("games.json"), "utf-8");
  return JSON.parse(raw) as GamesData;
}

export async function writeGames(data: GamesData): Promise<void> {
  await ensureInitialized();
  await fs.writeFile(
    filePath("games.json"),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

export async function readPredictions(): Promise<PredictionsData> {
  await ensureInitialized();
  const raw = await fs.readFile(filePath("predictions.json"), "utf-8");
  return JSON.parse(raw) as PredictionsData;
}

export async function writePredictions(data: PredictionsData): Promise<void> {
  await ensureInitialized();
  await fs.writeFile(
    filePath("predictions.json"),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}

export async function readDraftOrders(): Promise<DraftOrderData> {
  await ensureInitialized();
  const raw = await fs.readFile(filePath("draftOrders.json"), "utf-8");
  return JSON.parse(raw) as DraftOrderData;
}

export async function writeDraftOrders(data: DraftOrderData): Promise<void> {
  await ensureInitialized();
  await fs.writeFile(
    filePath("draftOrders.json"),
    JSON.stringify(data, null, 2),
    "utf-8",
  );
}
