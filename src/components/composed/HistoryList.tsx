// src/components/composed/HistoryList.tsx
// src/components/composed/HistoryList.tsx
// FlatList de HistoryItems com gerenciamento de swipe + EmptyState

import React, { useState, useCallback } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';
import { spacing } from '@/theme';
import type { EnrichedSaving } from '@/types';
import HistoryItem from './HistoryItem';
import EmptyState from '@/components/base/EmptyState';

type HistoryListProps = {
    savings: EnrichedSaving[];
    onDeleteRequest: (id: number) => void;
};

const keyExtractor = (item: EnrichedSaving) => item.id.toString();

function HistoryList({ savings, onDeleteRequest }: HistoryListProps) {
    const [openSwipeId, setOpenSwipeId] = useState<number | null>(null);

    const handleSwipeOpen = useCallback((id: number) => {
        setOpenSwipeId(id);
    }, []);

    const handleDeleteRequest = useCallback(
        (id: number) => {
            onDeleteRequest(id);
        },
        [onDeleteRequest],
    );

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<EnrichedSaving>) => (
            <HistoryItem
                saving={item}
                onDeleteRequest={handleDeleteRequest}
                isSwipeOpen={openSwipeId === item.id}
                onSwipeOpen={handleSwipeOpen}
            />
        ),
        [openSwipeId, handleDeleteRequest, handleSwipeOpen],
    );

    if (savings.length === 0) {
        return (
            <EmptyState
                icon="📭"
                title="Nenhum registro ainda"
                subtitle="Suas economias aparecerão aqui após salvar no simulador."
            />
        );
    }

    return (
        <FlatList
            data={savings}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            accessibilityRole="list"
            onScrollBeginDrag={() => {
                if (openSwipeId !== null) {
                    setOpenSwipeId(null);
                }
            }}
        />
    );
}

const styles = StyleSheet.create({
    list: {
        paddingBottom: spacing['3xl'],
    },
});

export default React.memo(HistoryList);
