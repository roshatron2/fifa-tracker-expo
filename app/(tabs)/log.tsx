import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { FIFA23AllTeams } from "../../constants/shorthands";
import { getPlayers } from "../../api/database";
import AsyncStorage from '@react-native-async-storage/async-storage';

type Team = { name: string; code: string };

interface Tournament {
  id: string;
  name: string;
  playerIds: string[];
}

const Log = () => {
  const [allPlayers, setAllPlayers] = useState<{ name: string; id: string }[]>([]);
  const [tournamentPlayers, setTournamentPlayers] = useState<{ name: string; id: string }[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [player1, setPlayer1] = useState<{ name: string; id: string } | null>(
    null
  );
  const [player2, setPlayer2] = useState<{ name: string; id: string } | null>(
    null
  );
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const [error, setError] = useState("");
  const [teamSuggestions1, setTeamSuggestions1] = useState<Team[]>([]);
  const [teamSuggestions2, setTeamSuggestions2] = useState<Team[]>([]);

  // Load current tournament and filter players
  useEffect(() => {
    const loadCurrentTournament = async () => {
      try {
        const tournamentId = await AsyncStorage.getItem('selectedTournamentId');
        if (tournamentId) {
          const tournaments = await AsyncStorage.getItem('tournaments');
          if (tournaments) {
            const tournamentList = JSON.parse(tournaments);
            const tournament = tournamentList.find((t: any) => t.id === tournamentId);
            if (tournament) {
              setCurrentTournament(tournament);
            }
          }
        }
      } catch (error) {
        console.error('Error loading current tournament:', error);
      }
    };

    loadCurrentTournament();
  }, []);

  // Fetch all players and filter by tournament
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const fetchedPlayers = await getPlayers();
        setAllPlayers(fetchedPlayers);
      } catch (error) {
        console.error("Error fetching players:", error);
        setError("Failed to load players");
      }
    };

    fetchPlayers();
  }, []);

  // Filter players based on current tournament
  useEffect(() => {
    if (currentTournament && allPlayers.length > 0) {
      const filtered = allPlayers.filter(player => 
        currentTournament.playerIds && currentTournament.playerIds.includes(player.id)
      );
      setTournamentPlayers(filtered);
      
      // Reset player selections if current players are not in tournament
      if (player1 && !filtered.find(p => p.id === player1.id)) {
        setPlayer1(filtered.length > 0 ? filtered[0] : null);
      }
      if (player2 && !filtered.find(p => p.id === player2.id)) {
        setPlayer2(filtered.length > 1 ? filtered[1] : filtered[0] || null);
      }
    } else {
      setTournamentPlayers([]);
      setPlayer1(null);
      setPlayer2(null);
    }
  }, [currentTournament, allPlayers]);

  const filterTeams = (
    text: string,
    setter: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    if (text) {
      const regex = new RegExp(`^${text}`, "i");
      setter(
        FIFA23AllTeams.filter((item) => regex.test(item.name)).slice(0, 5)
      );
    } else {
      setter([]);
    }
  };

  const handleNext = () => {
    if (!currentTournament) {
      setError("Please select a tournament first");
      return;
    }
    
    if (tournamentPlayers.length < 2) {
      setError("Tournament needs at least 2 players to log a match");
      return;
    }

    if (team1.trim() && team2.trim()) {
      setError("");
      router.push({
        pathname: "/match",
        params: {
          player1_name: player1?.name,
          player2_name: player2?.name,
          team1_name: team1,
          team2_name: team2,
          player1_id: player1?.id,
          player2_id: player2?.id,
        },
      });
    } else {
      setError("Please fill in both team names");
    }
  };

  const handleTeamInput = (
    text: string,
    setTeam: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<Team[]>>
  ) => {
    setTeam(text);
    filterTeams(text, setSuggestions);
  };

  const handleTeamSelect = (
    team: string,
    setTeam: React.Dispatch<React.SetStateAction<string>>,
    setSuggestions: React.Dispatch<React.SetStateAction<Team[]>>
  ) => {
    setTeam(team);
    setSuggestions([]);
  };

  if (!currentTournament) {
    return (
      <View className="flex-1 bg-black p-5 justify-center items-center">
        <Text className="text-white text-2xl text-center mb-5">No Tournament Selected</Text>
        <Text className="text-gray-400 text-base text-center mb-5">
          Please select a tournament to log matches
        </Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg px-6 py-3"
          onPress={() => router.push('/(tabs)/tournaments')}
        >
          <Text className="text-white font-semibold">Select Tournament</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (tournamentPlayers.length < 2) {
    return (
      <View className="flex-1 bg-black p-5 justify-center items-center">
        <Text className="text-white text-2xl text-center mb-5">Not Enough Players</Text>
        <Text className="text-gray-400 text-base text-center mb-5">
          Tournament needs at least 2 players to log matches
        </Text>
        <TouchableOpacity
          className="bg-blue-500 rounded-lg px-6 py-3"
          onPress={() => router.push('/(tabs)/tournaments')}
        >
          <Text className="text-white font-semibold">Add Players</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black p-5 justify-center">
      <View className="mb-5">
        <Text className="text-white text-2xl text-center mb-2">Match</Text>
        <Text className="text-gray-400 text-center">{currentTournament.name}</Text>
      </View>

      <View className="flex-row justify-between mb-5">
        {[
          { player: player1, setPlayer: setPlayer1, team: team1 },
          { player: player2, setPlayer: setPlayer2, team: team2 },
        ].map((data, index) => (
          <View key={index} className="flex-1 mx-1">
            <Text className="text-white mb-1">Player {index + 1}</Text>
            <View className="bg-white rounded mb-2">
              <Picker
                selectedValue={data.player}
                onValueChange={data.setPlayer}
                className="h-10 w-full"
              >
                {tournamentPlayers.map((player) => (
                  <Picker.Item
                    key={player.id}
                    label={player.name}
                    value={player}
                  />
                ))}
              </Picker>
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row justify-between mb-5">
        {[
          {
            team: team1,
            setTeam: setTeam1,
            suggestions: teamSuggestions1,
            setSuggestions: setTeamSuggestions1,
          },
          {
            team: team2,
            setTeam: setTeam2,
            suggestions: teamSuggestions2,
            setSuggestions: setTeamSuggestions2,
          },
        ].map((teamData, index) => (
          <View key={index} className="flex-1 mx-1">
            <Text className="text-white mb-1">Team {index + 1}</Text>
            <View className="bg-white rounded flex-row items-center">
              <TextInput
                value={teamData.team}
                onChangeText={(text) =>
                  handleTeamInput(
                    text,
                    teamData.setTeam,
                    teamData.setSuggestions
                  )
                }
                className="flex-1 h-10 px-2"
              />
              <Picker
                selectedValue={teamData.team}
                onValueChange={(itemValue) =>
                  handleTeamSelect(
                    itemValue,
                    teamData.setTeam,
                    teamData.setSuggestions
                  )
                }
                className="w-8 h-10"
                mode="dropdown"
              >
                <Picker.Item label="" value="" />
                {FIFA23AllTeams.map((team) => (
                  <Picker.Item
                    key={`${team.code}-${team.name}`}
                    label={team.name}
                    value={team.name}
                  />
                ))}
              </Picker>
            </View>
            {teamData.suggestions.length > 0 && (
              <FlatList
                data={teamData.suggestions}
                renderItem={({ item }: { item: Team }) => (
                  <TouchableOpacity
                    onPress={() =>
                      handleTeamSelect(
                        item.name,
                        teamData.setTeam,
                        teamData.setSuggestions
                      )
                    }
                  >
                    <Text className="bg-white text-black p-2">{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => `${item.code}-${index}`}
                className="absolute top-full left-0 right-0 z-10"
              />
            )}
          </View>
        ))}
      </View>
      {error ? <Text className="text-red-500 mb-2">{error}</Text> : null}

      <TouchableOpacity
        className="bg-white rounded p-2 self-end mt-5"
        onPress={handleNext}
      >
        <Text className="text-black">Next</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Log;
