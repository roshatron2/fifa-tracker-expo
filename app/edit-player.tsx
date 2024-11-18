import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native'
import React, { useState, useEffect } from 'react'
import { Picker } from '@react-native-picker/picker'
import { getPlayers } from '../utils/database'

const EditPlayer = () => {
  const [players, setPlayers] = useState<{ name: string; id: string }[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [error, setError] = useState("")

  const fetchPlayers = async () => {
    try {
      const fetchedPlayers = await getPlayers();
      setPlayers(fetchedPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      setError("Failed to load players");
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  // Update newName when a player is selected
  useEffect(() => {
    if (selectedPlayer) {
      const player = players.find(p => p.id === selectedPlayer);
      if (player) {
        setNewName(player.name);
      }
    } else {
      setNewName('');
    }
  }, [selectedPlayer]);

  const handleUpdate = async () => {
    if (!selectedPlayer || !newName.trim()) {
      Alert.alert('Error', 'Please select a player and enter a name')
      return
    }

    Alert.alert(
      'Confirm Update',
      'Are you sure you want to update this player\'s name?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Update',
          onPress: async () => {
            try {
              // TODO: Implement update functionality using your database utility
              // await updatePlayer(selectedPlayer, newName);
              Alert.alert('Success', 'Player updated successfully')
              await fetchPlayers();
              setSelectedPlayer(null);
              setNewName('');
            } catch (error) {
              console.error('Error updating player:', error)
              Alert.alert('Error', 'Failed to update player')
            }
          },
        },
      ]
    )
  }

  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">Edit Player</Text>
      
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

      <TextInput
        className="mb-4 p-3 border border-gray-300 rounded-lg"
        value={newName}
        onChangeText={setNewName}
        placeholder="Enter new name"
        editable={!!selectedPlayer}
      />

      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <TouchableOpacity 
        className={`p-3 rounded-lg ${
          selectedPlayer && newName.trim() 
            ? 'bg-blue-500' 
            : 'bg-blue-300'
        }`}
        onPress={handleUpdate}
        disabled={!selectedPlayer || !newName.trim()}
      >
        <Text className="text-white text-center font-semibold">
          Update Player
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default EditPlayer