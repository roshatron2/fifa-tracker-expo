import { View, Text, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import { getPlayerStats, getPlayers } from '../../api/database'
import { DetailedPlayerStats } from '../../api/database'
import { Card } from '../../components/Card'
import { Picker } from "@react-native-picker/picker"


const PlayerStats = () => {
  const { playerId: initialPlayerId } = useLocalSearchParams()
  const [stats, setStats] = useState<DetailedPlayerStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [players, setPlayers] = useState<{ name: string; id: string }[]>([])
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('')

  useEffect(() => {
    const fetchPlayers = async () => {
      const fetchedPlayers = await getPlayers()
      setPlayers(fetchedPlayers)
      if (initialPlayerId) {
        setSelectedPlayerId(initialPlayerId as string)
      }
    }
    fetchPlayers()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedPlayerId) {
        setStats(null)
        return
      }
      
      setLoading(true)
      const playerStats = await getPlayerStats(selectedPlayerId)
      setStats(playerStats)
      setLoading(false)
    }

    fetchStats()
  }, [selectedPlayerId])

  return (
    <ScrollView className="flex-1 p-4 bg-black">
      <View className="bg-[#1e2430] rounded mb-4">
        <Picker
          selectedValue={selectedPlayerId}
          onValueChange={setSelectedPlayerId}
          className="h-12"
          dropdownIconColor="black"
          itemStyle={{ color: 'black' }}
          style={{ color: 'black' }}
        >
          <Picker.Item 
            label="Select a player" 
            value="" 
            color='black'
          />
          {players.map((player) => (
            <Picker.Item 
              key={player.id} 
              label={player.name} 
              value={player.id}
              color='black'
            />
          ))}
        </Picker>
      </View>

      {loading ? (
        <Text className="text-white">Loading...</Text>
      ) : !selectedPlayerId ? (
        <Text className="text-center text-white">Please select a player to view their stats</Text>
      ) : !stats ? (
        <Text className="text-white">No stats found</Text>
      ) : (
        <>
          <Text className="text-2xl font-bold mb-4 text-center text-white">{stats.name}'s Statistics</Text>

          <Card title="Overview">
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-400">Total Matches:</Text>
              <Text className="text-base font-medium text-white">{stats.total_matches}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Points:</Text>
              <Text className="text-base font-medium">{stats.points}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Win Rate:</Text>
              <Text className="text-base font-medium">{(stats.win_rate * 100).toFixed(1)}%</Text>
            </View>
          </Card>

          <Card title="Match Results">
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Wins:</Text>
              <Text className="text-base font-medium">{stats.wins}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Losses:</Text>
              <Text className="text-base font-medium">{stats.losses}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Draws:</Text>
              <Text className="text-base font-medium">{stats.draws}</Text>
            </View>
          </Card>

          <Card title="Goals">
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Goals Scored:</Text>
              <Text className="text-base font-medium">{stats.total_goals_scored}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Goals Conceded:</Text>
              <Text className="text-base font-medium">{stats.total_goals_conceded}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Avg. Goals Scored:</Text>
              <Text className="text-base font-medium">{stats.average_goals_scored.toFixed(2)}</Text>
            </View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-base text-gray-600">Avg. Goals Conceded:</Text>
              <Text className="text-base font-medium">{stats.average_goals_conceded.toFixed(2)}</Text>
            </View>
          </Card>

          <Card title="Head to Head Records">
            <Text className="text-base font-bold mb-2">Most Wins Against:</Text>
            {Object.entries(stats.highest_wins_against).map(([player, wins]) => (
              <View key={player} className="flex-row justify-between mb-2">
                <Text className="text-base text-gray-600">{player}:</Text>
                <Text className="text-base font-medium">{wins} wins</Text>
              </View>
            ))}

            <Text className="text-base font-bold mb-2 mt-4">Most Losses Against:</Text>
            {Object.entries(stats.highest_losses_against).map(([player, losses]) => (
              <View key={player} className="flex-row justify-between mb-2">
                <Text className="text-base text-gray-600">{player}:</Text>
                <Text className="text-base font-medium">{losses} losses</Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </ScrollView>
  )
}

export default PlayerStats