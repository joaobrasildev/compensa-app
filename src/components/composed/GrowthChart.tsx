// src/components/composed/GrowthChart.tsx
// src/components/composed/GrowthChart.tsx
// Line chart RF (verde) vs BTC (laranja) ao longo do tempo

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, sizes, spacing, borderWidths, fonts } from '@/theme';
import type { ChartDataPoint } from '@/types';
import AppText from '@/components/base/AppText';

type GrowthChartProps = {
    chartData: ChartDataPoint[];
};

const CHART_HEIGHT = 180;
const SCREEN_PADDING = 40;

function GrowthChart({ chartData }: GrowthChartProps) {
    const screenWidth = Dimensions.get('window').width - SCREEN_PADDING;

    const chartConfig = useMemo(
        () => ({
            backgroundGradientFrom: colors.bgCard,
            backgroundGradientTo: colors.bgCard,
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 214, 143, ${opacity})`,
            labelColor: () => colors.textMuted,
            propsForDots: {
                r: '3',
                strokeWidth: '1',
            },
            propsForBackgroundLines: {
                stroke: colors.border,
                strokeDasharray: '',
            },
            fillShadowGradientFrom: colors.green,
            fillShadowGradientTo: colors.transparent,
            fillShadowGradientFromOpacity: 0.15,
            fillShadowGradientToOpacity: 0,
        }),
        [],
    );

    const data = useMemo(() => {
        if (chartData.length === 0) {
            return {
                labels: [''],
                datasets: [{ data: [0] }],
            };
        }

        // Limitar labels para não ficar poluído
        const maxLabels = 5;
        const step = Math.max(1, Math.floor(chartData.length / maxLabels));
        const labels = chartData.map((point, i) => {
            if (i % step === 0 || i === chartData.length - 1) {
                // Formato curto DD/MM
                const parts = point.date.split('-');
                return `${parts[2]}/${parts[1]}`;
            }
            return '';
        });

        return {
            labels,
            datasets: [
                {
                    data: chartData.map((p) => p.rfValue),
                    color: () => colors.green,
                    strokeWidth: 2,
                },
                {
                    data: chartData.map((p) => p.btcValue),
                    color: () => colors.btcOrange,
                    strokeWidth: 2,
                },
            ],
            legend: ['RF', 'BTC'],
        };
    }, [chartData]);

    if (chartData.length === 0) return null;

    return (
        <View
            style={styles.container}
            accessible
            accessibilityRole="image"
            accessibilityLabel="Gráfico de crescimento: linha verde para Renda Fixa, linha laranja para Bitcoin"
        >
            <LineChart
                data={data}
                width={screenWidth}
                height={CHART_HEIGHT}
                chartConfig={chartConfig}
                bezier
                withInnerLines
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLabels
                withVerticalLabels
                fromZero
                style={styles.chart}
            />

            {/* Legenda */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
                    <AppText variant="muted" style={styles.legendText}>Renda Fixa</AppText>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.btcOrange }]} />
                    <AppText variant="muted" style={styles.legendText}>Bitcoin</AppText>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.bgCard,
        borderWidth: borderWidths.thin,
        borderColor: colors.border,
        borderRadius: sizes.projCardRadius,
        paddingVertical: spacing.lg,
        overflow: 'hidden',
    },
    chart: {
        marginLeft: -spacing.lg,
        borderRadius: sizes.projCardRadius,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing['2xl'],
        marginTop: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: sizes.textSm,
        fontWeight: fonts.weight.medium,
    },
});

export default React.memo(GrowthChart);
