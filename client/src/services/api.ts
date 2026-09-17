import axios from 'axios';
import type { WasteAnalysis, AnalysisResult, DashboardData, AnalysesResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

// ─── Analyze ─────────────────────────────────────────────────────────────────
export async function analyzeWaste(imageFile: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', imageFile);
  const { data } = await api.post<AnalysisResult>('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });
  return data;
}

// ─── Analyses (CRUD) ──────────────────────────────────────────────────────────
export async function saveAnalysis(analysis: Omit<WasteAnalysis, '_id'>): Promise<WasteAnalysis> {
  const { data } = await api.post<WasteAnalysis>('/analyses', analysis);
  return data;
}

export interface FetchAnalysesParams {
  search?: string;
  material?: string;
  action?: string;
  condition?: string;
  page?: number;
  limit?: number;
}

export async function fetchAnalyses(params: FetchAnalysesParams = {}): Promise<AnalysesResponse> {
  const { data } = await api.get<AnalysesResponse>('/analyses', { params });
  return data;
}

export async function fetchAnalysis(id: string): Promise<WasteAnalysis> {
  const { data } = await api.get<WasteAnalysis>(`/analyses/${id}`);
  return data;
}

export async function deleteAnalysis(id: string): Promise<void> {
  await api.delete(`/analyses/${id}`);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export async function fetchDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>('/dashboard');
  return data;
}

// ─── Error helper ─────────────────────────────────────────────────────────────
export function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    return err.response?.data?.error || err.message || 'Something went wrong.';
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred.';
}
