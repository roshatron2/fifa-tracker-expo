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
import { getPlayers } from '@/api/database';

interface Tournament {
  id: string;
  name: string;
  createdAt: string;
  playerCount: number;
  player_ids: string[];
}

interface Player {
  id: string;
  name: string;
}

export default function TournamentsScreen() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTournamentName, setNewTournamentName] = useState('');
  const [addPlayerModalVisible, setAddPlayerModalVisible] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);

  useEffect(() => {
    loadTournaments();
    loadAllPlayers();
  }, []);

  useEffect(() => {
    // Fuzzy search implementation
    if (searchQuery.trim() === '') {
      setFilteredPlayers(allPlayers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = allPlayers.filter(player => 
        player.name.toLowerCase().includes(query) ||
        player.name.toLowerCase().split(' ').some(word => word.startsWith(query))
      );
      setFilteredPlayers(filtered);
    }
  }, [searchQuery, allPlayers]);

  const loadTournaments = async () => {
    try {
      const storedTournaments = await AsyncStorage.getItem('tournaments');
      if (storedTournaments) {
        const parsedTournaments = JSON.parse(storedTournaments);
        // Ensure all tournaments have player_ids array
        const updatedTournaments = parsedTournaments.map((tournament: any) => ({
          ...tournament,
          player_ids: tournament.player_ids || []
        }));
        setTournaments(updatedTournaments);
      }
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const loadAllPlayers = async () => {
    try {
      const players = await getPlayers();
      setAllPlayers(players);
      setFilteredPlayers(players);
    } catch (error) {
      console.error('Error loading players:', error);
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
      player_ids: [],
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

  const openAddPlayerModal = (tournament: Tournament) => {
    setSelectedTournament(tournament);
    setSearchQuery('');
    setAddPlayerModalVisible(true);
  };

  const addPlayerToTournament = async (player: Player) => {
    if (!selectedTournament) return;

    // Check if player is already in the tournament
    if (selectedTournament.player_ids && selectedTournament.player_ids.includes(player.id)) {
      Alert.alert('Error', `${player.name} is already in this tournament`);
      return;
    }

    try {
      const updatedTournament = {
        ...selectedTournament,
        player_ids: [...(selectedTournament.player_ids || []), player.id],
        playerCount: selectedTournament.playerCount + 1,
      };

      const updatedTournaments = tournaments.map(t => 
        t.id === selectedTournament.id ? updatedTournament : t
      );

      await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
      setTournaments(updatedTournaments);
      setAddPlayerModalVisible(false);
      setSelectedTournament(null);
      Alert.alert('Success', `${player.name} added to tournament!`);
    } catch (error) {
      console.error('Error adding player to tournament:', error);
      Alert.alert('Error', 'Failed to add player to tournament');
    }
  };

  const removePlayerFromTournament = async (tournamentId: string, playerId: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;

    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${player.name} from this tournament?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTournament = {
                ...tournament,
                player_ids: (tournament.player_ids || []).filter(id => id !== playerId),
                playerCount: tournament.playerCount - 1,
              };

              const updatedTournaments = tournaments.map(t => 
                t.id === tournamentId ? updatedTournament : t
              );

              await AsyncStorage.setItem('tournaments', JSON.stringify(updatedTournaments));
              setTournaments(updatedTournaments);
              Alert.alert('Success', `${player.name} removed from tournament`);
            } catch (error) {
              console.error('Error removing player from tournament:', error);
              Alert.alert('Error', 'Failed to remove player from tournament');
            }
          },
        },
      ]
    );
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

  const getTournamentPlayers = (tournament: Tournament) => {
    return allPlayers.filter(player => tournament.player_ids && tournament.player_ids.includes(player.id));
  };

  const renderTournament = ({ item }: { item: Tournament }) => {
    const tournamentPlayers = getTournamentPlayers(item);
    
    return (
      <View className="bg-gray-800 rounded-xl p-4 mb-3">
        <TouchableOpacity
          className="flex-row items-center"
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
          <View className="flex-row">
            <TouchableOpacity
              className="p-2 mr-2"
              onPress={() => openAddPlayerModal(item)}
            >
              <Ionicons name="person-add-outline" size={20} color="#3b82f6" />
            </TouchableOpacity>
            <TouchableOpacity
              className="p-2"
              onPress={() => deleteTournament(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
        
        {/* Show tournament players */}
        {tournamentPlayers.length > 0 && (
          <View className="mt-3 pt-3 border-t border-gray-700">
            <Text className="text-gray-400 text-sm mb-2">Players:</Text>
            <View className="flex-row flex-wrap">
              {tournamentPlayers.map((player) => (
                <View key={player.id} className="bg-gray-700 rounded-lg px-2 py-1 mr-2 mb-2 flex-row items-center">
                  <Text className="text-white text-sm mr-2">{player.name}</Text>
                  <TouchableOpacity
                    onPress={() => removePlayerFromTournament(item.id, player.id)}
                  >
                    <Ionicons name="close-circle" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderPlayerItem = ({ item }: { item: Player }) => (
    <TouchableOpacity
      className="bg-gray-700 rounded-lg p-3 mb-2 flex-row items-center justify-between"
      onPress={() => addPlayerToTournament(item)}
    >
      <Text className="text-white text-base">{item.name}</Text>
      <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
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

      {/* Create Tournament Modal */}
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

      {/* Add Player Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addPlayerModalVisible}
        onRequestClose={() => setAddPlayerModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-gray-800 rounded-xl p-6 w-4/5 max-w-sm max-h-4/5">
            <Text className="text-white text-xl font-bold mb-5 text-center">
              Add Player to {selectedTournament?.name}
            </Text>
            
            <TextInput
              className="bg-gray-700 rounded-lg p-3 text-base text-white mb-4"
              placeholder="Search players..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            
            <FlatList
              data={filteredPlayers}
              renderItem={renderPlayerItem}
              keyExtractor={(item) => item.id}
              className="max-h-64"
              showsVerticalScrollIndicator={false}
            />
            
            <TouchableOpacity
              className="bg-gray-700 p-3 rounded-lg mt-4"
              onPress={() => {
                setAddPlayerModalVisible(false);
                setSelectedTournament(null);
                setSearchQuery('');
              }}
            >
              <Text className="text-white text-center text-base font-semibold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
} 