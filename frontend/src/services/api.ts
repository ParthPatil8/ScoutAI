import {
  PlayerProfile,
  AssessmentSession,
  ScoutEvaluation,
  PlayerBenchmark,
  DatasetSource,
  MLModel,
  PlayerComparisonResponse
} from '../types';
import {
  DEMO_PLAYERS,
  DEMO_ASSESSMENTS,
  DEMO_EVALUATIONS,
  DEMO_BENCHMARKS,
  DEMO_DATASETS,
  DEMO_MODELS,
  generateDemoComparison
} from './demoData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_V1 = `${BASE_URL}/api/v1`;

export interface BackendStatus {
  isOnline: boolean;
  dialect?: string;
  version?: string;
  latencyMs?: number;
}

export class ApiService {
  private static forceDemoMode = false;

  static setDemoMode(enabled: boolean) {
    this.forceDemoMode = enabled;
  }

  static isDemoMode(): boolean {
    return this.forceDemoMode;
  }

  // Check health of backend
  static async checkHealth(): Promise<BackendStatus> {
    if (this.forceDemoMode) {
      return { isOnline: false };
    }
    const start = performance.now();
    try {
      const res = await fetch(`${BASE_URL}/health/db`, { signal: AbortSignal.timeout(2000) });
      const latencyMs = Math.round(performance.now() - start);
      if (res.ok) {
        const data = await res.json();
        return {
          isOnline: true,
          dialect: data.database_dialect || 'sqlite',
          version: '1.0.0',
          latencyMs
        };
      }
      return { isOnline: false };
    } catch {
      return { isOnline: false };
    }
  }

  // PLAYERS
  static async getPlayers(roleFilter?: string, search?: string): Promise<{ items: PlayerProfile[]; total: number; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const params = new URLSearchParams();
        if (roleFilter && roleFilter !== 'ALL') params.append('role', roleFilter);
        if (search) params.append('search', search);
        
        const res = await fetch(`${API_V1}/players?${params.toString()}`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          // Merge avatar placeholders if missing
          const items = (data.items || []).map((p: PlayerProfile, i: number) => ({
            ...p,
            avatar_url: p.avatar_url || DEMO_PLAYERS[i % DEMO_PLAYERS.length].avatar_url,
            latest_score: p.latest_score ?? 85.0,
            assessment_count: p.assessment_count ?? 1,
          }));
          return { items, total: data.total || items.length, isLive: true };
        }
      } catch (err) {
        console.warn('Backend unavailable, falling back to demo players:', err);
      }
    }

    // Demo fallback
    let items = [...DEMO_PLAYERS];
    if (roleFilter && roleFilter !== 'ALL') {
      items = items.filter(p => p.primary_role === roleFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(p => 
        p.display_name.toLowerCase().includes(q) ||
        (p.current_team && p.current_team.toLowerCase().includes(q))
      );
    }
    return { items, total: items.length, isLive: false };
  }

  static async getPlayerById(id: string): Promise<{ player: PlayerProfile | null; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/players/${id}`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const player = await res.json();
          const avatar = DEMO_PLAYERS.find(p => p.id === id)?.avatar_url || DEMO_PLAYERS[0].avatar_url;
          return { player: { ...player, avatar_url: avatar }, isLive: true };
        }
      } catch (err) {
        console.warn('Backend unavailable, falling back to demo player profile:', err);
      }
    }

    const p = DEMO_PLAYERS.find(item => item.id === id) || DEMO_PLAYERS[0];
    return { player: p, isLive: false };
  }

  static async createPlayer(playerData: Partial<PlayerProfile>): Promise<{ player: PlayerProfile; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/players`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(playerData),
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const created = await res.json();
          return { player: created, isLive: true };
        }
      } catch (err) {
        console.warn('Backend player creation failed, returning local creation:', err);
      }
    }

    const newPlayer: PlayerProfile = {
      id: `p-${Date.now()}`,
      first_name: playerData.first_name || 'New',
      last_name: playerData.last_name || 'Prospect',
      display_name: `${playerData.first_name || 'New'} ${playerData.last_name || 'Prospect'}`,
      primary_role: playerData.primary_role || 'BATSMAN',
      batting_hand: playerData.batting_hand || 'RIGHT_HAND',
      bowling_style: playerData.bowling_style || 'NONE',
      height_cm: playerData.height_cm || 178,
      weight_kg: playerData.weight_kg || 72,
      nationality: playerData.nationality || 'India',
      current_team: playerData.current_team || 'Academy Pool',
      scout_notes: playerData.scout_notes || 'Registered via ScoutAI scout portal.',
      is_synthetic: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      latest_score: 75.0,
      assessment_count: 0,
      avatar_url: DEMO_PLAYERS[0].avatar_url,
    };
    DEMO_PLAYERS.unshift(newPlayer);
    return { player: newPlayer, isLive: false };
  }

  // ASSESSMENTS
  static async getAssessments(playerId?: string): Promise<{ items: AssessmentSession[]; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const url = playerId 
          ? `${API_V1}/assessments?player_id=${playerId}`
          : `${API_V1}/assessments`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          return { items: data.items || [], isLive: true };
        }
      } catch (err) {
        console.warn('Backend assessments unavailable, using demo:', err);
      }
    }

    let items = [...DEMO_ASSESSMENTS];
    if (playerId) {
      items = items.filter(a => a.player_id === playerId);
    }
    return { items, isLive: false };
  }

  static async getAssessmentDetail(assessmentId: string): Promise<{ assessment: AssessmentSession | null; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/assessments/${assessmentId}`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data = await res.json();
          return { assessment: data, isLive: true };
        }
      } catch (err) {
        console.warn('Backend assessment detail unavailable, using demo:', err);
      }
    }

    const a = DEMO_ASSESSMENTS.find(item => item.id === assessmentId) || DEMO_ASSESSMENTS[1];
    return { assessment: a, isLive: false };
  }

  // MEDIA UPLOAD
  static async uploadVideo(file: File): Promise<{ media: any; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('is_synthetic', 'false');

        const res = await fetch(`${API_V1}/media/upload`, {
          method: 'POST',
          body: formData,
          signal: AbortSignal.timeout(30000), // 30s for video upload
        });

        if (res.ok) {
          const media = await res.json();
          return { media, isLive: true };
        }
      } catch (err) {
        console.warn('Backend video upload failed, falling back:', err);
      }
    }

    return {
      media: {
        id: `media-${Date.now()}`,
        original_filename: file.name,
        file_size_bytes: file.size,
        mime_type: file.type || 'video/mp4',
        duration_sec: 2.5,
        fps: 30.0,
      },
      isLive: false,
    };
  }

  static async createAndProcessAssessment(
    playerId: string,
    sessionName: string,
    assessmentType: string,
    videoFile?: File | null
  ): Promise<{ assessment: AssessmentSession; isLive: boolean }> {
    let mediaAssetId: string | null = null;

    if (!this.forceDemoMode) {
      try {
        // Step 0: Upload video file if provided
        if (videoFile) {
          const uploadRes = await this.uploadVideo(videoFile);
          if (uploadRes.media?.id && uploadRes.isLive) {
            mediaAssetId = uploadRes.media.id;
          }
        }

        // Step 1: Create session
        const createRes = await fetch(`${API_V1}/assessments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: playerId,
            media_asset_id: mediaAssetId,
            session_name: sessionName,
            assessment_type: assessmentType,
            is_synthetic: true
          }),
          signal: AbortSignal.timeout(5000)
        });

        if (createRes.ok) {
          const newSession = await createRes.json();
          // Step 2: Trigger pipeline processing
          const procRes = await fetch(`${API_V1}/assessments/${newSession.id}/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model_identifier: 'cricket-kinematics-v1',
              force_reprocess: true
            }),
            signal: AbortSignal.timeout(8000)
          });

          if (procRes.ok) {
            // Step 3: Fetch full assessment detail with generated metrics
            const detailRes = await fetch(`${API_V1}/assessments/${newSession.id}`);
            if (detailRes.ok) {
              const fullAssessment = await detailRes.json();
              return { assessment: fullAssessment, isLive: true };
            }
          }
        }
      } catch (err) {
        console.warn('Live assessment pipeline failed, running simulation fallback:', err);
      }
    }

    // Simulated assessment run
    const player = DEMO_PLAYERS.find(p => p.id === playerId) || DEMO_PLAYERS[0];
    const isBatting = assessmentType.includes('BATTING');
    
    const simulated: AssessmentSession = {
      id: `a-run-${Date.now()}`,
      player_id: playerId,
      session_name: sessionName,
      assessment_type: assessmentType as any,
      status: 'COMPLETED',
      assessment_date: new Date().toISOString().split('T')[0],
      execution_duration_sec: 1.48,
      overall_provisional_score: isBatting ? 84.5 : 88.0,
      confidence_score: 0.91,
      scout_summary: isBatting
        ? 'Automated biomechanical evaluation complete (60 frames analyzed). High front-foot stability with excellent head lock over point of contact.'
        : 'Automated bowling kinematics complete (60 frames analyzed). Delivery elbow extension legally compliant at 11.2 deg (<15 deg ICC threshold).',
      is_synthetic: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      player,
      metrics: isBatting
        ? [
            {
              id: `m-${Date.now()}-1`,
              assessment_session_id: `a-run-${Date.now()}`,
              player_id: playerId,
              metric_name: 'front_knee_flexion_angle',
              category: 'BATTING',
              value: 139.5,
              unit: 'deg',
              benchmark_percentile: 84.0,
              confidence: 0.92,
              origin: 'AUTO_DETECTED',
              is_provisional: true,
              interpretation: 'Solid lead knee bend maintaining low center of gravity.',
              created_at: new Date().toISOString()
            },
            {
              id: `m-${Date.now()}-2`,
              assessment_session_id: `a-run-${Date.now()}`,
              player_id: playerId,
              metric_name: 'front_foot_stride_ratio',
              category: 'BATTING',
              value: 0.74,
              unit: 'ratio',
              benchmark_percentile: 82.0,
              confidence: 0.89,
              origin: 'AUTO_DETECTED',
              is_provisional: true,
              interpretation: 'Optimal stride proportion enabling reach without over-committing weight.',
              created_at: new Date().toISOString()
            },
            {
              id: `m-${Date.now()}-3`,
              assessment_session_id: `a-run-${Date.now()}`,
              player_id: playerId,
              metric_name: 'head_over_ball_alignment_score',
              category: 'BATTING',
              value: 0.88,
              unit: 'score_0_to_1',
              benchmark_percentile: 89.0,
              confidence: 0.88,
              origin: 'AUTO_DETECTED',
              is_provisional: true,
              interpretation: 'Head vertically aligned directly above lead knee at impact.',
              created_at: new Date().toISOString()
            }
          ]
        : [
            {
              id: `m-${Date.now()}-4`,
              assessment_session_id: `a-run-${Date.now()}`,
              player_id: playerId,
              metric_name: 'bowling_elbow_extension_angle',
              category: 'BOWLING',
              value: 11.2,
              unit: 'deg',
              benchmark_percentile: 86.0,
              confidence: 0.90,
              origin: 'AUTO_DETECTED',
              is_provisional: true,
              interpretation: 'Fully compliant delivery action safely below 15-deg ICC limit.',
              created_at: new Date().toISOString()
            },
            {
              id: `m-${Date.now()}-5`,
              assessment_session_id: `a-run-${Date.now()}`,
              player_id: playerId,
              metric_name: 'front_knee_brace_angle',
              category: 'BOWLING',
              value: 170.0,
              unit: 'deg',
              benchmark_percentile: 89.0,
              confidence: 0.91,
              origin: 'AUTO_DETECTED',
              is_provisional: true,
              interpretation: 'Strong front-leg brace transferring run-up momentum into arm speed.',
              created_at: new Date().toISOString()
            }
          ]
    };

    DEMO_ASSESSMENTS.unshift(simulated);
    return { assessment: simulated, isLive: false };
  }

  // EVALUATIONS
  static async getEvaluations(playerId?: string): Promise<{ items: ScoutEvaluation[]; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const url = playerId ? `${API_V1}/evaluations?player_id=${playerId}` : `${API_V1}/evaluations`;
        const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const items = await res.json();
          return { items, isLive: true };
        }
      } catch (err) {
        console.warn('Backend evaluations unavailable, using demo:', err);
      }
    }
    let items = [...DEMO_EVALUATIONS];
    if (playerId) {
      items = items.filter(e => e.player_id === playerId);
    }
    return { items, isLive: false };
  }

  static async createEvaluation(evalData: Partial<ScoutEvaluation>): Promise<{ evaluation: ScoutEvaluation; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/evaluations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(evalData),
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const created = await res.json();
          return { evaluation: created, isLive: true };
        }
      } catch (err) {
        console.warn('Backend evaluation save failed, using local:', err);
      }
    }

    const newEval: ScoutEvaluation = {
      id: `eval-${Date.now()}`,
      player_id: evalData.player_id || 'p-arjun-verma',
      assessment_session_id: evalData.assessment_session_id || null,
      evaluator_name: evalData.evaluator_name || 'Senior Talent Scout',
      evaluator_organization: evalData.evaluator_organization || 'Regional Cricket Academy',
      evaluation_date: new Date().toISOString().split('T')[0],
      technical_rating: evalData.technical_rating || 8.5,
      tactical_rating: evalData.tactical_rating || 8.0,
      physical_rating: evalData.physical_rating || 8.2,
      mental_rating: evalData.mental_rating || 8.0,
      overall_rating: evalData.overall_rating || 8.2,
      scout_recommendation: evalData.scout_recommendation || 'SHORTLIST',
      strengths: evalData.strengths || 'Strong balance, clean technical presentation.',
      development_areas: evalData.development_areas || 'Continue routine biomechanical conditioning.',
      detailed_notes: evalData.detailed_notes || 'Observed in live competitive nets.',
      is_synthetic: true,
      created_at: new Date().toISOString()
    };
    DEMO_EVALUATIONS.unshift(newEval);
    return { evaluation: newEval, isLive: false };
  }

  // BENCHMARKS & COMPARISONS
  static async getBenchmarks(): Promise<{ items: PlayerBenchmark[]; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/analytics/benchmarks`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const items = await res.json();
          return { items, isLive: true };
        }
      } catch (err) {
        console.warn('Backend benchmarks unavailable, using demo:', err);
      }
    }
    return { items: DEMO_BENCHMARKS, isLive: false };
  }

  static async comparePlayers(
    primaryPlayerId: string,
    targetPlayerId?: string,
    benchmarkLevel: string = 'ACADEMY'
  ): Promise<{ comparison: PlayerComparisonResponse; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/analytics/compare`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            player_id: primaryPlayerId,
            target_player_id: targetPlayerId || null,
            benchmark_level: benchmarkLevel
          }),
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const comparison = await res.json();
          return { comparison, isLive: true };
        }
      } catch (err) {
        console.warn('Backend compare endpoint unavailable, using demo comparison generator:', err);
      }
    }

    const p1 = DEMO_PLAYERS.find(p => p.id === primaryPlayerId) || DEMO_PLAYERS[0];
    const p2 = targetPlayerId ? DEMO_PLAYERS.find(p => p.id === targetPlayerId) || null : null;
    const comparison = generateDemoComparison(p1, p2);
    return { comparison, isLive: false };
  }

  // DATASETS & MODELS
  static async getDatasets(): Promise<{ items: DatasetSource[]; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/datasets/sources`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const items = await res.json();
          return { items, isLive: true };
        }
      } catch (err) {
        console.warn('Backend datasets unavailable, using demo sources:', err);
      }
    }
    return { items: DEMO_DATASETS, isLive: false };
  }

  static async getModels(): Promise<{ items: MLModel[]; isLive: boolean }> {
    if (!this.forceDemoMode) {
      try {
        const res = await fetch(`${API_V1}/models`, { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const items = await res.json();
          return { items, isLive: true };
        }
      } catch (err) {
        console.warn('Backend models unavailable, using demo models:', err);
      }
    }
    return { items: DEMO_MODELS, isLive: false };
  }
}
