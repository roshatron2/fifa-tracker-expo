import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { getTable, PlayerStats } from '@/api/database';
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

export default function Table() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<string | null>(null);

  const fetchTable = useCallback(async () => {
    const tableData = await getTable();
    setPlayers(tableData);
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
            setCurrentTournament(tournament.name);
          }
        }
      }
    } catch (error) {
      console.error('Error loading current tournament:', error);
    }
  }, []);

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
              {currentTournament || 'No Tournament Selected'}
            </Text>
            <Text className="text-[#8b949e] text-sm">
              {currentTournament ? 'Current Tournament' : 'Select a tournament to get started'}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-[#0284c7] rounded-lg px-4 py-2 flex-row items-center"
            onPress={() => router.push('/tournaments')}
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
          <View className="rounded-lg overflow-hidden">
            {renderHeader()}
            {players.map((player, index) => renderPlayerRow(player, index))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
