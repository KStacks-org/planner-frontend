import { SearchParams, SearchResponse } from "@/types";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL || "https://api.kauindex.com";

export const searchCourses = async (
  params: SearchParams,
): Promise<SearchResponse> => {
  // Clean up params: remove null, empty strings, or 'all' defaults
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v != null && v !== "" && v !== "all",
    ),
  );

  const { data } = await axios.get<SearchResponse>(`${BASE_URL}/search`, {
    params: cleanParams,
  });
  return data;
};

// Duct-tape: fetch latest course objects by CRN via the existing /search endpoint
export async function getSectionByCrn(crn: string, termCode?: string) {
  const params = new URLSearchParams({ crn });
  if (termCode) params.set("termCode", termCode);

  const res = await fetch(`/section?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to fetch section ${crn}`);
  return (await res.json()) as { status: string; data: any };
}
