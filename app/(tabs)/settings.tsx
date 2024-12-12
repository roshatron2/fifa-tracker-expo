import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const Settings = () => {

  return (
    <View className="flex-1 bg-black p-5 justify-center">
      <TouchableOpacity
        className="bg-white rounded p-2 mb-3"
        onPress={() => router.push('/manage-players')}
      >
        <Text className="text-black text-center">Manage Players</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white rounded p-2 mb-3"
        onPress={() => router.push('/edit-match-history')}
      >
        <Text className="text-black text-center">Edit Match History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white rounded p-2 mb-3"
        onPress={() => router.push('/player-stats')}
      >
        <Text className="text-black text-center">Player Stats</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white rounded p-2"
        onPress={() => router.push('/head-to-head')}
      >
        <Text className="text-black text-center">Head to Head</Text>
      </TouchableOpacity>
    </View>
  )
}

export default Settings