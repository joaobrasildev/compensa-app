import React, { useCallback, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
    BannerAd,
    BannerAdSize,
    TestIds,
} from 'react-native-google-mobile-ads';

import { colors, sizes } from '@/theme';

const AD_UNIT_ID = __DEV__
    ? TestIds.ADAPTIVE_BANNER
    : Platform.select({
        ios: 'ca-app-pub-9302632754670115/3627321872',
        android: 'ca-app-pub-9302632754670115/6253485210',
    }) ?? '';

type AdBannerProps = {
    /** Se true, solicita apenas anúncios não-personalizados (ATT negado) */
    nonPersonalized?: boolean;
    /** Indica que o SDK do Google Mobile Ads já foi inicializado */
    sdkReady?: boolean;
};

const AdBanner = React.memo(function AdBanner({ nonPersonalized = true, sdkReady = false }: AdBannerProps) {
    const [adError, setAdError] = useState(false);

    const handleAdFailedToLoad = useCallback(() => {
        setAdError(true);
    }, []);

    return (
        <View
            style={styles.container}
            accessibilityLabel="Área de anúncio"
            accessibilityRole="none"
        >
            {sdkReady && !adError && (
                <BannerAd
                    unitId={AD_UNIT_ID}
                    size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                    requestOptions={{
                        requestNonPersonalizedAdsOnly: nonPersonalized,
                    }}
                    onAdFailedToLoad={handleAdFailedToLoad}
                />
            )}
        </View>
    );
});

const styles = StyleSheet.create({
    container: {
        height: sizes.adBannerHeight,
        paddingVertical: sizes.adBannerPaddingV,
        backgroundColor: colors.adBannerBg,
        borderTopWidth: 1,
        borderTopColor: colors.adBorderTop,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default AdBanner;
