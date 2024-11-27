import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import { recordMatch } from '../../api/database';

const Match = () => {
  const { player1_name, player2_name, team1_name, team2_name, player1_id, player2_id } = useLocalSearchParams();
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const updateScore = (player: number, increment: number) => {
    if (player === 1) {
      setScore1(prevScore => Math.max(0, prevScore + increment));
    } else {
      setScore2(prevScore => Math.max(0, prevScore + increment));
    }
  };

  const handleEndMatch = () => {
    setShowConfirmation(true);
  };

  const confirmEndMatch = () => {
    recordMatch(player1_id as string, player2_id as string, team1_name as string, team2_name as string, score1, score2); // Pass scores as numbers
    setShowConfirmation(false);
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-1 p-6 justify-between">
        <TouchableOpacity 
          className="bg-red-500 rounded-full px-4 py-2 self-end mb-4"
          onPress={handleEndMatch}
        >
          <Text className="text-white font-semibold">End Match</Text>
        </TouchableOpacity>

        <View className="flex-row justify-between flex-1">
          {[
            { player: player1_name, team: team1_name, score: score1, updateScore: (inc: number) => updateScore(1, inc) },
            { player: player2_name, team: team2_name, score: score2, updateScore: (inc: number) => updateScore(2, inc) }
          ].map((data, index) => (
            <View key={index} className="flex-1 items-center justify-center mx-4">
              <Text className="text-white text-3xl font-bold mb-2">{data.player as string}</Text>
              <Text className="text-gray-400 text-xl mb-6">({data.team as string})</Text>
              <View className="bg-gray-800 rounded-2xl p-8 mb-8">
                <Text className="text-white text-8xl font-bold text-center">{data.score}</Text>
              </View>
              <View className="flex-row justify-center">
                <TouchableOpacity onPress={() => data.updateScore(-1)} className="bg-red-500 rounded-full p-6 mr-6">
                  <AntDesign name="minus" size={32} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => data.updateScore(1)} className="bg-green-500 rounded-full p-6">
                  <AntDesign name="plus" size={32} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={showConfirmation}
          onRequestClose={() => setShowConfirmation(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-gray-800 p-6 rounded-lg">
              <Text className="text-white text-lg mb-4">Are you sure you want to end the match?</Text>
              <View className="flex-row justify-around">
                <TouchableOpacity 
                  className="bg-red-500 px-4 py-2 rounded"
                  onPress={confirmEndMatch}
                >
                  <Text className="text-white">Yes, End Match</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className="bg-gray-500 px-4 py-2 rounded"
                  onPress={() => setShowConfirmation(false)}
                >
                  <Text className="text-white">Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default Match;