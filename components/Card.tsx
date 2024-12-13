import { View, Text } from 'react-native'
import React from 'react'

interface CardProps {
  title: string
  children: React.ReactNode
  darkMode?: boolean
}

export const Card = ({ title, children, darkMode = false }: CardProps) => {
  return (
    <View className={`${darkMode ? 'bg-[#1e2430]' : 'bg-white'} rounded-lg p-4 mb-4 shadow-sm`}>
      <Text className={`text-lg font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>{title}</Text>
      <View className="gap-2">
        {children}
      </View>
    </View>
  )
} 