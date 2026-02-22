// src/components/composed/ProjectionGroup.tsx
// src/components/composed/ProjectionGroup.tsx
// Renderiza 3 ProjectionCards na ordem: 10 anos (destaque), 1 ano, 5 anos

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { spacing } from '@/theme';
import type { Projection } from '@/types';
import ProjectionCard from './ProjectionCard';

type ProjectionGroupProps = {
    projections: Projection[];
};

const DISPLAY_ORDER = ['10y', '1y', '5y'] as const;

function ProjectionGroup({ projections }: ProjectionGroupProps) {
    const ordered = useMemo(() => {
        return DISPLAY_ORDER
            .map((period) => projections.find((p) => p.period === period))
            .filter((p): p is Projection => p != null);
    }, [projections]);

    return (
        <View style={styles.container}>
            {ordered.map((projection) => (
                <ProjectionCard key={projection.period} projection={projection} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
});

export default React.memo(ProjectionGroup);
