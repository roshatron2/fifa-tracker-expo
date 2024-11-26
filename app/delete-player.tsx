import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Picker } from '@react-native-picker/picker'
import { getPlayers, deletePlayer } from '../utils/database'

const DeletePlayer = () => {
  const [players, setPlayers] = useState<{ name: string; id: string }[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const fetchedPlayers = await getPlayers();
        setPlayers(fetchedPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
        setError("Failed to load players");
      }
    };

    fetchPlayers();
  }, []);

  const handleDelete = async () => {
    if (!selectedPlayer) {
      Alert.alert('Error', 'Please select a player to delete')
      return
    }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this player?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlayer(selectedPlayer);
              const fetchedPlayers = await getPlayers(); // Refresh the list
              setPlayers(fetchedPlayers);
              setSelectedPlayer(null);
              Alert.alert('Success', 'Player deleted successfully');
            } catch (error) {
              console.error('Error deleting player:', error);
              Alert.alert('Error', 'Failed to delete player');
            }
          },
        },
      ]
    )
  }

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">Delete Player</Text>
      
      <View className="mb-4 border border-gray-300 rounded-lg">
        <Picker
          selectedValue={selectedPlayer}
          onValueChange={(itemValue) => setSelectedPlayer(itemValue)}
          className="h-12"
        >
          <Picker.Item label="Select a player..." value={null} />
          {players.map((player) => (
            <Picker.Item 
              key={player.id} 
              label={player.name} 
              value={player.id} 
            />
          ))}
        </Picker>
      </View>

      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <TouchableOpacity 
        className={`p-3 rounded-lg ${
          selectedPlayer 
            ? 'bg-red-500' 
            : 'bg-red-300'
        }`}
        onPress={handleDelete}
        disabled={!selectedPlayer}
      >
        <Text className="text-white text-center font-semibold">
          Delete Player
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default DeletePlayer