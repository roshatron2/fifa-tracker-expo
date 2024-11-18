import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getPlayers, getHeadToHead } from '../utils/database';

interface Player {
  name: string;
  id: string;
}

interface HeadToHeadStats {
  player1_wins: number;
  player2_wins: number;
  draws: number;
  player1_goals: number;
  player2_goals: number;
}

export default function HeadToHead() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [player1Id, setPlayer1Id] = useState<string>('');
  const [player2Id, setPlayer2Id] = useState<string>('');
  const [stats, setStats] = useState<HeadToHeadStats | null>(null);

  useEffect(() => {
    loadPlayers();
  }, []);

  useEffect(() => {
    if (player1Id && player2Id && player1Id !== player2Id) {
      loadHeadToHead();
    } else {
      setStats(null);
    }
  }, [player1Id, player2Id]);

  const loadPlayers = async () => {
    const fetchedPlayers = await getPlayers();
    setPlayers(fetchedPlayers);
    if (fetchedPlayers.length > 0) {
      setPlayer1Id(fetchedPlayers[0].id);
      setPlayer2Id(fetchedPlayers[0].id);
    }
  };

  const loadHeadToHead = async () => {
    const headToHeadStats = await getHeadToHead(player1Id, player2Id);
    setStats(headToHeadStats);
  };

  const getPlayerName = (id: string) => {
    return players.find(p => p.id === id)?.name || '';
  };

  return (
    <View className="p-4 bg-gray-900 min-h-screen">
      <View className="flex flex-row justify-between mb-8">
        <View className="flex-1 mr-2 bg-white rounded">
          <Picker
            selectedValue={player1Id}
            onValueChange={setPlayer1Id}
            className="bg-gray-800 text"
          >
            {players.map(player => (
              <Picker.Item 
                key={player.id} 
                label={player.name} 
                value={player.id}
                color="black"
              />
            ))}
          </Picker>
        </View>
        <View className="flex-1 ml-2 bg-white rounded">
          <Picker
            selectedValue={player2Id}
            onValueChange={setPlayer2Id}
            className="bg-gray-800 text"
          >
            {players.map(player => (
              <Picker.Item 
                key={player.id} 
                label={player.name} 
                value={player.id}
                color="black"
              />
            ))}
          </Picker>
        </View>
      </View>

      <View className="flex flex-row justify-between mb-12">
        <Text className="text-3xl font-bold text-white">
          {getPlayerName(player1Id)}
        </Text>
        <Text className="text-3xl font-bold text-white">
          {getPlayerName(player2Id)}
        </Text>
      </View>

      {stats && player1Id !== player2Id && (
        <View className="space-y-8">
          <View className="flex flex-row justify-between items-center">
            <Text className="text-4xl font-bold text-white">{stats.player1_wins}</Text>
            <Text className="text-xl text-white">wins</Text>
            <Text className="text-4xl font-bold text-white">{stats.player2_wins}</Text>
          </View>

          <View className="flex flex-row justify-between items-center">
            <Text className="text-4xl font-bold text-white">{stats.draws}</Text>
            <Text className="text-xl text-white">draws</Text>
            <Text className="text-4xl font-bold text-white">{stats.draws}</Text>
          </View>

          <View className="flex flex-row justify-between items-center">
            <Text className="text-4xl font-bold text-white">{stats.player1_goals}</Text>
            <Text className="text-xl text-white">goals</Text>
            <Text className="text-4xl font-bold text-white">{stats.player2_goals}</Text>
          </View>

          <View className="flex flex-row justify-between items-center">
            <Text className="text-4xl font-bold text-white">0</Text>
            <Text className="text-xl text-white">clean sheets</Text>
            <Text className="text-4xl font-bold text-white">0</Text>
          </View>
        </View>
      )}
    </View>
  );
}