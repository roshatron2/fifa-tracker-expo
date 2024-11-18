import { View, Text, TextInput, TouchableOpacity } from 'react-native'
import React from 'react'
import { createPlayer } from '@/utils/database';

const CreatePlayer = () => {
  const [playerName, setPlayerName] = React.useState('');

  const handleCreatePlayer = async () => {
    const player = await createPlayer(playerName);
    console.log(player);
  }

  return (
    <View className="flex-1 bg-black p-5 justify-center">
      <Text className="text-white text-2xl text-center mb-5">Create Player</Text>
      <View className="bg-white rounded p-2">
        <TextInput
          placeholder="Enter player name"
          value={playerName}
          onChangeText={setPlayerName}
        />
      </View>
      <TouchableOpacity className="bg-white rounded p-2" onPress={handleCreatePlayer}>
        <Text className="text-black text-center mt-5">Create</Text>
      </TouchableOpacity>

    </View>
  )
}

export default CreatePlayer