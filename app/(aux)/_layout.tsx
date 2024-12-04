import { Stack } from "expo-router";

const AuxLayout = () => {

  return (
    <>
      <Stack>
        <Stack.Screen
          name="manage-players"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="edit-match-history"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="player-stats"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="head-to-head"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
};

export default AuxLayout;