// src/components/composed/GrowthChart.tsx
// Gráfico de barras empilhadas por mês (RF verde + BTC laranja)

import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import { colors, sizes, spacing, borderWidths, fonts } from '@/theme';
import type { ChartDataPoint } from '@/types';
import AppText from '@/components/base/AppText';

type GrowthChartProps = {
    chartData: ChartDataPoint[];
};

const SCREEN_PADDING = 40;
const CHART_PADDING_TOP = 8;
const CHART_PADDING_BOTTOM = 20;
const Y_TICK_COUNT = 4;

/** Arredonda para o milhar mais próximo acima (ou centena se < 1000) */
function ceilToNice(value: number): number {
    if (value <= 0) return 100;
    if (value < 1000) return Math.ceil(value / 100) * 100;
    return Math.ceil(value / 1000) * 1000;
}

/** Formata valor do eixo Y de forma compacta */
function formatYLabel(value: number): string {
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return String(value);
}

function GrowthChart({ chartData }: GrowthChartProps) {
    const screenWidth = Dimensions.get('window').width - SCREEN_PADDING;

    const { maxY, yTicks } = useMemo(() => {
        const maxTotal = Math.max(...chartData.map((d) => d.total), 0);
        const rounded = ceilToNice(maxTotal);
        const ticks: number[] = [];
        for (let i = 0; i <= Y_TICK_COUNT; i++) {
            ticks.push(Math.round((rounded / Y_TICK_COUNT) * i));
        }
        return { maxY: rounded, yTicks: ticks };
    }, [chartData]);

    const svgHeight = sizes.chartHeight + CHART_PADDING_TOP + CHART_PADDING_BOTTOM;
    const plotAreaLeft = sizes.chartYLabelWidth;
    const plotAreaWidth = screenWidth - plotAreaLeft - spacing.md;
    const plotAreaHeight = sizes.chartHeight;

    const barCount = chartData.length;
    const gapSize = barCount > 1 ? spacing.md : 0;
    const totalGaps = barCount > 1 ? (barCount - 1) * gapSize : 0;
    const barWidth = Math.min(
        sizes.chartBarWidth,
        barCount > 0 ? (plotAreaWidth - totalGaps) / barCount : sizes.chartBarWidth,
    );
    const totalBarsWidth = barCount * barWidth + totalGaps;
    const offsetX = plotAreaLeft + (plotAreaWidth - totalBarsWidth) / 2;

    const bars = useMemo(() => {
        if (maxY === 0) return [];

        return chartData.map((point, i) => {
            const x = offsetX + i * (barWidth + gapSize);
            const rfH = (point.rfAmount / maxY) * plotAreaHeight;
            const btcH = (point.btcAmount / maxY) * plotAreaHeight;
            const totalH = rfH + btcH;
            const barBottom = CHART_PADDING_TOP + plotAreaHeight;

            return {
                key: point.month,
                x,
                label: point.label,
                // BTC fica no topo (empilhado sobre RF)
                btcY: barBottom - totalH,
                btcH,
                // RF fica na base
                rfY: barBottom - rfH,
                rfH,
                labelX: x + barWidth / 2,
                labelY: barBottom + spacing.xl + spacing.xxs,
            };
        });
    }, [chartData, maxY, offsetX, barWidth, gapSize, plotAreaHeight]);

    if (chartData.length === 0) return null;

    return (
        <View
            style={styles.container}
            accessible
            accessibilityRole="image"
            accessibilityLabel="Gráfico de barras: verde para Renda Fixa, laranja para Bitcoin, agrupado por mês"
        >
            <Svg width={screenWidth} height={svgHeight}>
                {/* Grid horizontal + labels eixo Y */}
                {yTicks.map((tick) => {
                    const y =
                        CHART_PADDING_TOP +
                        plotAreaHeight -
                        (tick / maxY) * plotAreaHeight;
                    return (
                        <React.Fragment key={`y-${tick}`}>
                            <Line
                                x1={plotAreaLeft}
                                y1={y}
                                x2={screenWidth - spacing.md}
                                y2={y}
                                stroke={colors.border}
                                strokeWidth={0.5}
                            />
                            <SvgText
                                x={plotAreaLeft - spacing.md}
                                y={y + 3}
                                fontSize={sizes.chartYLabelSize}
                                fill={colors.textMuted}
                                textAnchor="end"
                            >
                                {formatYLabel(tick)}
                            </SvgText>
                        </React.Fragment>
                    );
                })}

                {/* Barras empilhadas */}
                {bars.map((bar) => (
                    <React.Fragment key={bar.key}>
                        {/* RF (verde) — base, cantos arredondados embaixo */}
                        {bar.rfH > 0 && (
                            <Rect
                                x={bar.x}
                                y={bar.rfY}
                                width={barWidth}
                                height={Math.max(bar.rfH, 1)}
                                rx={bar.btcH > 0 ? 0 : sizes.chartBarRadius}
                                ry={bar.btcH > 0 ? 0 : sizes.chartBarRadius}
                                fill={colors.green}
                                opacity={0.85}
                            />
                        )}
                        {/* Canto arredondado inferior quando ambos existem */}
                        {bar.rfH > sizes.chartBarRadius && bar.btcH > 0 && (
                            <Rect
                                x={bar.x}
                                y={bar.rfY + bar.rfH - sizes.chartBarRadius}
                                width={barWidth}
                                height={sizes.chartBarRadius}
                                rx={sizes.chartBarRadius}
                                ry={sizes.chartBarRadius}
                                fill={colors.green}
                                opacity={0.85}
                            />
                        )}
                        {/* BTC (laranja) — topo, cantos arredondados em cima */}
                        {bar.btcH > 0 && (
                            <Rect
                                x={bar.x}
                                y={bar.btcY}
                                width={barWidth}
                                height={Math.max(bar.btcH, 1)}
                                rx={sizes.chartBarRadius}
                                ry={sizes.chartBarRadius}
                                fill={colors.btcOrange}
                                opacity={0.85}
                            />
                        )}
                        {/* Retângulo de junção BTC sem arredondamento embaixo */}
                        {bar.btcH > sizes.chartBarRadius && bar.rfH > 0 && (
                            <Rect
                                x={bar.x}
                                y={bar.btcY + bar.btcH - sizes.chartBarRadius}
                                width={barWidth}
                                height={sizes.chartBarRadius}
                                fill={colors.btcOrange}
                                opacity={0.85}
                            />
                        )}
                        {/* Label do mês */}
                        <SvgText
                            x={bar.labelX}
                            y={bar.labelY}
                            fontSize={sizes.chartLabelSize}
                            fill={colors.textMuted}
                            textAnchor="middle"
                        >
                            {bar.label}
                        </SvgText>
                    </React.Fragment>
                ))}
            </Svg>

            {/* Legenda */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            { backgroundColor: colors.green },
                        ]}
                    />
                    <AppText variant="muted" style={styles.legendText}>
                        Renda Fixa
                    </AppText>
                </View>
                <View style={styles.legendItem}>
                    <View
                        style={[
                            styles.legendDot,
                            { backgroundColor: colors.btcOrange },
                        ]}
                    />
                    <AppText variant="muted" style={styles.legendText}>
                        Bitcoin
                    </AppText>
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
        width: spacing.md,
        height: spacing.md,
        borderRadius: spacing.xs,
    },
    legendText: {
        fontSize: sizes.textSm,
        fontWeight: fonts.weight.medium,
    },
});

export default React.memo(GrowthChart);
