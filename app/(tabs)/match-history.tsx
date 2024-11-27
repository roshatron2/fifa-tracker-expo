import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { MatchResult, getMatchHistory } from '../../api/database';
import { Colors } from '../../constants/Colors';


const MatchResultItem = ({ result }: { result: MatchResult }) => {
  const formattedDate = format(new Date(result.date), 'EEE d MMM yyyy');
  
  return (
    <View className="mb-4">
      <View className={`flex-row items-center justify-between p-4 bg-[#1e2430] rounded-lg`}>
        <View className="flex-1">
          <Text className="font-semibold text-white">{result.player1_name}</Text>
        </View>
        <View className="flex-row items-center justify-center flex-1">
          <Text className="text-white font-bold text-lg">
            {result.player1_goals} - {result.player2_goals}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-white font-semibold">{result.player2_name}</Text>
        </View>
      </View>
    </View>
  );
};


export default function MatchHistory() {
  const [results, setResults] = useState<MatchResult[]>([]);

  const fetchResults = useCallback(async () => {
    const resultsData = await getMatchHistory();
    setResults(resultsData);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchResults();
    }, [fetchResults])
  );

  // Group results by date
  const groupedResults = results.reduce((acc, result) => {
    const date = format(new Date(result.date), 'EEE d MMM yyyy');
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(result);
    return acc;
  }, {} as Record<string, MatchResult[]>);

  return (
    <ScrollView className="bg-black p-4">
      {Object.entries(groupedResults).map(([date, matches]) => (
        <View key={date}>
          <Text className="text-white font-bold mb-2">{date}</Text>
          {matches.map((match) => (
            <MatchResultItem key={`${date}-${match.id}`} result={match} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
