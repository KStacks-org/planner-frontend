import type {
  GenPayload,
  GenResponse,
  GenSubjectsResponse,
} from "./generator-types";

const GEN_BASE_URL =
  import.meta.env.VITE_GEN_BASE_URL || "https://api-schedly.y-tools.xyz";

export async function fetchGenSubjects(): Promise<GenSubjectsResponse> {
  const res = await fetch(`${GEN_BASE_URL}/schedules/subjects`);
  if (!res.ok) throw new Error("Failed to fetch subjects");
  return res.json();
}

export async function generateSchedules(
  payload: GenPayload,
): Promise<GenResponse> {
  const res = await fetch(`${GEN_BASE_URL}/schedules/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to generate schedules");
  return res.json();
}
