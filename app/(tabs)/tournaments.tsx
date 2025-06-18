import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  playerCount: number;
}

export default function TournamentsScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState('');

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const storedTournaments = await AsyncStorage.getItem('tournaments');
      if (storedTournaments) {
        setTournaments(JSON.parse(storedTournaments));
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const createTournament = async () => {
    if (!newTournamentName.trim()) {
      Alert.alert('Error', 'Please enter a tournament name');
      return;
    }

    const newTournament: Tournament = {
      id: Date.now().toString(),
      name: newTournamentName.trim(),
      createdAt: new Date().toISOString(),
      playerCount: 0,
    };

    try {
      const updatedTournaments = [...tournaments, newTournament];
      await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
      setTournaments(updatedTournaments);
      setNewTournamentName('');
      setModalVisible(false);
      Alert.alert('Success', 'Tournament created successfully!');
    } catch (error) {
      console.error('Error creating tournament:', error);
      Alert.alert('Error', 'Failed to create tournament');
    }
  };

  const selectTournament = (tournament: Tournament) => {
    // Store the selected tournament ID and navigate to the table screen
    AsyncStorage.setItem('selectedTournamentId', tournament.id);
    router.push('/(tabs)/table');
  };

  const deleteTournament = async (tournamentId: string) => {
    Alert.alert(
      'Delete Tournament',
      'Are you sure you want to delete this tournament? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTournaments = tournaments.filter(t => t.id !== tournamentId);
              await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
              setTournaments(updatedTournaments);
            } catch (error) {
              console.error('Error deleting tournament:', error);
              Alert.alert('Error', 'Failed to delete tournament');
            }
          },
        },
      ]
    );
  };

  const renderTournament = ({ item }: { item: Tournament }) => (
    <TouchableOpacity
      className="bg-gray-800 rounded-xl p-4 mb-3 flex-row items-center"
      onPress={() => selectTournament(item)}
    >
      <View className="flex-1">
        <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
        <Text className="text-gray-400 text-sm mb-0.5">
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text className="text-blue-500 text-sm">
          {item.playerCount} player{item.playerCount !== 1 ? 's' : ''}
        </Text>
      </View>
      <TouchableOpacity
        className="p-2"
        onPress={() => deleteTournament(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <View className="flex-row justify-end items-center p-5 border-b border-gray-700">
        <TouchableOpacity
          className="bg-blue-500 rounded-lg p-2"
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {tournaments.length === 0 ? (
        <View className="flex-1 justify-center items-center px-10">
          <Ionicons name="trophy-outline" size={64} color="#64748b" />
          <Text className="text-white text-xl font-bold mt-4">No tournaments yet</Text>
          <Text className="text-gray-400 text-base text-center mt-2">
            Create your first tournament to get started
          </Text>
        </View>
      ) : (
        <FlatList
          data={tournaments}
          renderItem={renderTournament}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20 }}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-gray-800 rounded-xl p-6 w-4/5 max-w-sm">
            <Text className="text-white text-xl font-bold mb-5 text-center">
              Create New Tournament
            </Text>
            <TextInput
              className="bg-gray-700 rounded-lg p-3 text-base text-white mb-5"
              placeholder="Tournament name"
              placeholderTextColor="#64748b"
              value={newTournamentName}
              onChangeText={setNewTournamentName}
              autoFocus
            />
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 bg-gray-700 p-3 rounded-lg mr-2"
                onPress={() => {
                  setModalVisible(false);
                  setNewTournamentName('');
                }}
              >
                <Text className="text-white text-center text-base font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-blue-500 p-3 rounded-lg ml-2"
                onPress={createTournament}
              >
                <Text className="text-white text-center text-base font-semibold">Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 