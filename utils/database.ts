import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'https://precious-sincere-herring.ngrok-free.app';

export async function getPlayers(): Promise<{ name: string; id: string }[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/players`);
    return response.data.map((player: Player) => ({ name: player.name, id: player.id })); // Updated return statement
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Error fetching players:', {
        message: axiosError.message,
        code: axiosError.code,
        config: axiosError.config,
      });
      if (axiosError.code === 'ECONNREFUSED') {
        console.error('Unable to connect to the API server. Please check if the server is running.');
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return [];
  }
}

export async function recordMatch(player1_id: string, player2_id: string, team1: string, team2: string, player1_goals: number, player2_goals: number): Promise<Match | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/matches`, {
      player1_id,
      player2_id,
      team1,
      team2,
      player1_goals,
      player2_goals
    });
    return response.data;
  } catch (error) {
    console.error('Error recording match:', error);
    return null;
  }
}

export async function getTable(): Promise<PlayerStats[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching table:', error);
    return [];
  }
}

export async function getMatchHistory(): Promise<MatchResult[]> {
  try {
    const response = await axios.get(`${API_BASE_URL}/matches`);
    return response.data;
  } catch (error) {
    console.error('Error fetching match history:', error);
    return [];
  }
}

export async function createPlayer(name: string): Promise<Player | null> {
  try {
    const response = await axios.post(`${API_BASE_URL}/players`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating player:', error);
    return null;
  }
}

export async function getHeadToHead(player1_id: string, player2_id: string): Promise<{
  player1_wins: number,
  player2_wins: number,
  draws: number,
  player1_goals: number,
  player2_goals: number
}> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/head-to-head/${player1_id}/${player2_id}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching head-to-head stats:', error);
    return {
      player1_wins: 0,
      player2_wins: 0,
      draws: 0,
      player1_goals: 0,
      player2_goals: 0
    };
  }
}

export async function deletePlayer(player_id: string): Promise<void> {
  try {
    await axios.delete(`${API_BASE_URL}/players/${player_id}`);
  } catch (error) {
    console.error('Error deleting player:', error);
  }
}

interface Player {
  name: string;
  id: string;
}

interface Match {
  id: string;
  player1_id: string;
  player2_id: string;
  player1_goals: number;
  player2_goals: number;
  team1: string;
  team2: string;
  date: string;
}

export interface MatchResult  {
  id: string;
  player1_name: string;
  player2_name: string;
  player1_goals: number;
  player2_goals: number;
  date: string;
}

export interface PlayerStats {
  name: string;
  id: string;
  total_matches: number;
  total_goals_scored: number;
  total_goals_conceded: number;
  goal_difference: number;
  wins: number;
  losses: number;
  draws: number;
  points: number;
}

