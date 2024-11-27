import { View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { router } from 'expo-router'

const ManagePlayers = () => {
  return (
    <View className="p-4">
      <Text className="text-xl font-bold mb-4">Manage Players</Text>
      
      <View className="flex flex-col space-y-3">
        <TouchableOpacity 
          className="bg-green-500 p-3 rounded-lg"
          onPress={() => { router.push('/create-player')}}>
          <Text className="text-white text-center font-semibold">Create Player</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-blue-500 p-3 rounded-lg"
          onPress={() => { router.push('/edit-player')}}>
          <Text className="text-white text-center font-semibold">Edit Player</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-red-500 p-3 rounded-lg"
          onPress={() => { router.push('/delete-player')}}>
          <Text className="text-white text-center font-semibold">Delete Player</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ManagePlayers