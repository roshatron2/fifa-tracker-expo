import React, { useState, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { format } from 'date-fns';
import { MatchResult, getMatchHistory } from '../../utils/database';


const MatchResultItem = ({ result }: { result: MatchResult }) => {
  const formattedDate = format(new Date(result.date), 'EEE d MMM yyyy');
  
  return (
    <View className="mb-4">
      <Text className="text-[#37003c] font-semibold mb-2">{formattedDate}</Text>
      <View className="flex-row items-center justify-between bg-white p-4 rounded-lg">
        <View className="flex-1">
          <Text className="text-[#37003c] font-semibold">{result.player1_name}</Text>
        </View>
        <View className="flex-row items-center justify-center flex-1">
          <Text className="text-[#37003c] font-bold text-lg">
            {result.player1_goals} - {result.player2_goals}
          </Text>
        </View>
        <View className="flex-1 items-end">
          <Text className="text-[#37003c] font-semibold">{result.player2_name}</Text>
        </View>
      </View>
    </View>
  );
};


export default function MatchHistory() {
  const [results, setResults] = useState<MatchResult[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      const resultsData = await getMatchHistory();
      setResults(resultsData);
    };
    fetchResults();
  }, []);
  return (
    <View className="bg-[#f2f2f2] p-4">
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MatchResultItem result={item} />}
      />
    </View>
  );
}
