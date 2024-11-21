import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native'
import React from 'react'

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date: string;
  onEdit?: boolean;
  onScoreChange?: (type: 'home' | 'away', change: 'increment' | 'decrement') => void;
}

const MatchCard = ({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  date,
  onEdit = false,
  onScoreChange
}: MatchCardProps) => {
  return (
    <View className="bg-slate-800/60 rounded-lg p-4 mb-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-gray-300 rounded-md" />
          <Text className="text-white text-lg ml-2">{homeTeam}</Text>
        </View>

        <View className="flex-row items-center">
          {onEdit ? (
            <>
              <TouchableOpacity
                className="bg-slate-700 w-10 h-10 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('home', 'decrement')}
              >
                <Text className="text-white text-2xl font-bold">-</Text>
              </TouchableOpacity>
              <Text className="text-white text-2xl font-bold mx-3">{homeScore}</Text>
              <TouchableOpacity
                className="bg-slate-700 w-10 h-10 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('home', 'increment')}
              >
                <Text className="text-white text-2xl font-bold">+</Text>
              </TouchableOpacity>
              <Text className="text-white text-2xl font-bold mx-4">-</Text>
              <TouchableOpacity
                className="bg-slate-700 w-10 h-10 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('away', 'decrement')}
              >
                <Text className="text-white text-2xl font-bold">-</Text>
              </TouchableOpacity>
              <Text className="text-white text-2xl font-bold mx-3">{awayScore}</Text>
              <TouchableOpacity
                className="bg-slate-700 w-10 h-10 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('away', 'increment')}
              >
                <Text className="text-white text-2xl font-bold">+</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white text-2xl font-bold">{homeScore}</Text>
              <Text className="text-white text-2xl font-bold mx-4">-</Text>
              <Text className="text-white text-2xl font-bold">{awayScore}</Text>
            </>
          )}
        </View>

        <View className="flex-row items-center">
          <Text className="text-white text-lg mr-2">{awayTeam}</Text>
          <View className="w-10 h-10 bg-gray-300 rounded-md" />
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-gray-400">{date}</Text>
        <TouchableOpacity>
          <Text className="text-gray-400">Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const EditMatchHistory = () => {
  const [matches, setMatches] = React.useState([
    {
      id: 1,
      homeTeam: 'Arsenal',
      awayTeam: 'Chelsea',
      homeScore: 3,
      awayScore: 1,
      date: '5/15/2023',
      isEditing: false
    },
  ]);

  const handleScoreChange = (matchId: number, type: 'home' | 'away', change: 'increment' | 'decrement') => {
    setMatches(matches.map(match => {
      if (match.id === matchId) {
        const scoreKey = type === 'home' ? 'homeScore' : 'awayScore';
        const newScore = change === 'increment'
          ? match[scoreKey] + 1
          : Math.max(0, match[scoreKey] - 1);

        return {
          ...match,
          [scoreKey]: newScore
        };
      }
      return match;
    }));
  };

  return (
    <View className="flex-1 bg-slate-900">
      <Text className="text-white text-2xl font-bold p-4">Match History</Text>
      <ScrollView className="px-4">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            {...match}
            onEdit={match.isEditing}
            onScoreChange={(type, change) => handleScoreChange(match.id, type, change)}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default EditMatchHistory      