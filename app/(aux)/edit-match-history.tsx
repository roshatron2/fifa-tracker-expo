import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { getMatchHistory, updateMatch, deleteMatch } from '../../api/database'
import { MaterialIcons } from '@expo/vector-icons';

interface MatchCardProps {
  player1_name: string;
  player2_name: string;
  player1_goals: number;
  player2_goals: number;
  date: string;
  onEdit?: boolean;
  onScoreChange?: (type: 'player1' | 'player2', change: 'increment' | 'decrement') => void;
  toggleEdit?: (id: string) => void;
  id: string;
  onDelete?: (id: string) => void;
}

const MatchCard = ({
  player1_name,
  player2_name,
  player1_goals,
  player2_goals,
  date,
  onEdit = false,
  onScoreChange,
  toggleEdit,
  id,
  onDelete,
}: MatchCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
    const formattedTime = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
    return `${formattedDate}   ${formattedTime}`;
  };

  return (
    <View className="bg-slate-800/60 rounded-lg p-4 mb-4">
      <View className="flex-row items-center">
        <View className="w-24">
          <Text className="text-white text-base">{player1_name}</Text>
        </View>

        <View className="flex-row items-center justify-center flex-1">
          {onEdit ? (
            <>
              <TouchableOpacity
                className="bg-slate-700 w-8 h-8 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('player1', 'decrement')}
              >
                <Text className="text-white text-xl font-bold">-</Text>
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold w-8 text-center">{player1_goals}</Text>
              <TouchableOpacity
                className="bg-slate-700 w-8 h-8 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('player1', 'increment')}
              >
                <Text className="text-white text-xl font-bold">+</Text>
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold w-8 text-center">-</Text>
              <TouchableOpacity
                className="bg-slate-700 w-8 h-8 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('player2', 'decrement')}
              >
                <Text className="text-white text-xl font-bold">-</Text>
              </TouchableOpacity>
              <Text className="text-white text-xl font-bold w-8 text-center">{player2_goals}</Text>
              <TouchableOpacity
                className="bg-slate-700 w-8 h-8 rounded-full items-center justify-center"
                onPress={() => onScoreChange?.('player2', 'increment')}
              >
                <Text className="text-white text-xl font-bold">+</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white text-xl font-bold w-8 text-center">{player1_goals}</Text>
              <Text className="text-white text-xl font-bold w-8 text-center">-</Text>
              <Text className="text-white text-xl font-bold w-8 text-center">{player2_goals}</Text>
            </>
          )}
        </View>

        <View className="w-24">
          <Text className="text-white text-base text-right">{player2_name}</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-4">
        <Text className="text-gray-400">{formatDate(date)}</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={() => toggleEdit?.(id)}>
            <MaterialIcons 
              name={onEdit ? "check" : "edit"} 
              size={24} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete?.(id)}>
            <MaterialIcons 
              name="delete" 
              size={24} 
              color="#EF4444" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

interface Match {
  id: string;
  player1_name: string;
  player2_name: string;
  player1_goals: number;
  player2_goals: number;
  date: string;
  isEditing: boolean;
}

const EditMatchHistory = () => {
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const matchesData = await getMatchHistory();
    setMatches(matchesData.map((match) => ({
      ...match,
      isEditing: false
    })));
  };

  const handleScoreChange = (matchId: string, type: 'player1' | 'player2', change: 'increment' | 'decrement') => {
    setMatches(matches.map(match => {
      if (match.id === matchId) {
        const scoreKey = `${type}_goals` as 'player1_goals' | 'player2_goals';
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

  const toggleEdit = async (matchId: string) => {
    const match = matches.find(m => m.id === matchId);
    
    if (match?.isEditing) {
      try {
        // If we're finishing edit mode, update the database
        await updateMatch(matchId, match.player1_goals, match.player2_goals);
        // Refresh the matches after successful update
        await fetchMatches();
      } catch (error) {
        console.error('Error updating match:', error);
        Alert.alert('Error', 'Failed to update match');
      }
    } else {
      // Just toggle edit mode without fetching
      setMatches(matches.map(match => ({
        ...match,
        isEditing: match.id === matchId ? !match.isEditing : false
      })));
    }
  };

  const handleDelete = async (matchId: string) => {
    Alert.alert(
      "Delete Match",
      "Are you sure you want to delete this match?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMatch(matchId);
            setMatches(matches.filter(match => match.id !== matchId));
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
      <ScrollView className="p-4">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            {...match}
            onEdit={match.isEditing}
            onScoreChange={(type, change) => handleScoreChange(match.id, type, change)}
            toggleEdit={toggleEdit}
            onDelete={handleDelete}
            id={match.id}
          />
        ))}
      </ScrollView>
    </View>
  )
}

export default EditMatchHistory      