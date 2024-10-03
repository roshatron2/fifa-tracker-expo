import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { getTable, PlayerStats } from '@/utils/database';

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

  useEffect(() => {
    const fetchTable = async () => {
      const tableData = await getTable();
      setPlayers(tableData);
    };
    fetchTable();
  }, []);

  return (
    <View className="bg-[#1e2430] p-4">
      <View className="mb-4">
        <Text className="text-white text-xl font-bold">Player Statistics</Text>
      </View>
      <View className="rounded-lg overflow-hidden">
        {renderHeader()}
        {players.map((player, index) => renderPlayerRow(player, index))}
      </View>
    </View>
  );
}
