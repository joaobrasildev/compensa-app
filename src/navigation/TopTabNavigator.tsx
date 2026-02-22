// src/navigation/TopTabNavigator.tsx
// Navegação principal com 3 abas top tabs (Material Top Tabs)

import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { colors, sizes, fonts } from '@/theme';
import SimulatorScreen from '@/screens/SimulatorScreen';
import SummaryScreen from '@/screens/SummaryScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import TipsScreen from '@/screens/TipsScreen';

export type TopTabParamList = {
    Simulador: undefined;
    Resumo: undefined;
    'Histórico': undefined;
    Dicas: undefined;
};

const Tab = createMaterialTopTabNavigator<TopTabParamList>();

const TAB_BAR_STYLE = {
    backgroundColor: colors.bgPrimary,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardHover,
    elevation: 0,
    shadowOpacity: 0,
} as const;

const TAB_BAR_LABEL_STYLE = {
    fontSize: sizes.textLg,
    fontWeight: fonts.weight.semibold,
    textTransform: 'none' as const,
};

const TAB_BAR_INDICATOR_STYLE = {
    backgroundColor: colors.accent,
    height: 3,
} as const;

function TopTabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: TAB_BAR_STYLE,
                tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
                tabBarActiveTintColor: colors.textPrimary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarIndicatorStyle: TAB_BAR_INDICATOR_STYLE,
                swipeEnabled: true,
                lazy: true,
            }}
        >
            <Tab.Screen name="Simulador" component={SimulatorScreen} />
            <Tab.Screen name="Resumo" component={SummaryScreen} />
            <Tab.Screen name="Histórico" component={HistoryScreen} />
            <Tab.Screen name="Dicas" component={TipsScreen} />
        </Tab.Navigator>
    );
}

export default TopTabNavigator;
