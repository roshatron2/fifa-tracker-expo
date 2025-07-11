import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { getTable, PlayerStats, getPlayers } from '@/api/database';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const headers = ['Name', 'M', 'W', 'D', 'L', 'GF', 'GA', 'GD', 'Pts'];

const renderHeader = () => (
  <View className="flex-row bg-[#2a3241] py-2.5">
    {headers.map((header, index) => (
      <Text
        key={index}
        className={`text-[#8b949e] text-center text-sm ${index === 0 ? 'flex-[1.5] text-left' : 'flex-1'
          }`}
      >
        {header}
      </Text>
    ))}
  </View>
);

const renderPlayerRow = (player: PlayerStats, index: number) => (
  <View key={index} className="flex-row border-b border-[#2a3241] py-2.5">
    <Text className="flex-[1.5] text-white text-left text-sm">
      {player.name}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.total_matches}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.wins}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.draws}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.losses}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.total_goals_scored}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.total_goals_conceded}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.total_goals_scored - player?.total_goals_conceded}
    </Text>
    <Text className="flex-1 text-white text-center text-sm">
      {player?.points}
    </Text>
  </View>
);

interface Tournament {
  id: string;
  name: string;
  player_ids: string[];
}

export default function Table() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [allPlayers, setAllPlayers] = useState<PlayerStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);

  const fetchTable = useCallback(async () => {
    const tableData = await getTable();
    setAllPlayers(tableData);
    setRefreshing(false);
  }, []);

  const loadCurrentTournament = useCallback(async () => {
    try {
      const tournamentId = await AsyncStorage.getItem('selectedTournamentId');
      if (tournamentId) {
        const tournaments = await AsyncStorage.getItem('tournaments');
        if (tournaments) {
          const tournamentList = JSON.parse(tournaments);
          const tournament = tournamentList.find((t: any) => t.id === tournamentId);
          if (tournament) {
            setCurrentTournament(tournament);
          }
        }
      }
    } catch (error) {
      console.error('Error loading current tournament:', error);
    }
  }, []);

  // Filter players based on current tournament
  useEffect(() => {
    if (currentTournament && allPlayers.length > 0) {
      const tournamentPlayers = allPlayers.filter(player => 
        currentTournament.player_ids && currentTournament.player_ids.includes(player.id)
      );
      setPlayers(tournamentPlayers);
    } else {
      setPlayers([]);
    }
  }, [currentTournament, allPlayers]);

  useFocusEffect(
    useCallback(() => {
      fetchTable();
      loadCurrentTournament();
    }, [fetchTable, loadCurrentTournament])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTable();
  }, [fetchTable]);

  return (
    <View className="flex-1 bg-[#1e2430]">
      {/* Tournament Header */}
      <View className="bg-[#1a1f2e] p-4 border-b border-[#2a3241]">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">
              {currentTournament?.name || 'No Tournament Selected'}
            </Text>
            <Text className="text-[#8b949e] text-sm">
              {currentTournament 
                ? `${players.length} player${players.length !== 1 ? 's' : ''} in tournament`
                : 'Select a tournament to get started'
              }
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#0284c7] rounded-lg px-4 py-2 flex-row items-center"
            onPress={() => router.push('/(tabs)/tournaments')}
          >
            <Ionicons name="trophy-outline" size={16} color="#ffffff" />
            <Text className="text-white font-semibold ml-2">
              {currentTournament ? 'Switch' : 'Select'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#ffffff']}
            tintColor="#ffffff"
          />
        }
      >
        <View className="p-4">
          {players.length === 0 ? (
            <View className="flex-1 justify-center items-center py-20">
              <Ionicons name="people-outline" size={64} color="#64748b" />
              <Text className="text-white text-xl font-bold mt-4">
                {currentTournament ? 'No players in tournament' : 'No tournament selected'}
              </Text>
              <Text className="text-gray-400 text-base text-center mt-2">
                {currentTournament 
                  ? 'Add players to this tournament to see the table'
                  : 'Select a tournament to view its table'
                }
              </Text>
              {currentTournament && (
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg px-6 py-3 mt-4"
                  onPress={() => router.push('/(tabs)/tournaments')}
                >
                  <Text className="text-white font-semibold">Add Players</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="rounded-lg overflow-hidden">
              {renderHeader()}
              {players.map((player, index) => renderPlayerRow(player, index))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
