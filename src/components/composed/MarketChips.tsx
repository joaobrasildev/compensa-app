// src/components/composed/MarketChips.tsx
// src/components/composed/MarketChips.tsx
// Renderiza 2 Chips lado a lado: BTC + SELIC

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing, colors } from '@/theme';
import Chip from '@/components/base/Chip';
import { formatBRL } from '@/rules/formatRules';

type MarketChipsProps = {
    btcPrice: number;
    selicRate: number;
};

function MarketChips({ btcPrice, selicRate }: MarketChipsProps) {
    const btcFormatted = formatBRL(btcPrice);
    const selicFormatted = `${selicRate.toFixed(2).replace('.', ',')}%`;

    return (
        <View style={styles.container}>
            <Chip
                icon="₿"
                label="Bitcoin"
                value={btcFormatted}
                accentColor={colors.btcOrange}
            />
            <Chip
                icon="📊"
                label="Selic"
                value={selicFormatted}
                accentColor={colors.accent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.md,
    },
});

export default React.memo(MarketChips);
