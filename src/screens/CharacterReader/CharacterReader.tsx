import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import ScreenBackground from '../../components/ui/ScreenBackground';
import PrimaryButton from '../../components/ui/PrimaryButton';
import { FontFamily } from '../../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { metrics } from '../../constants/metrics';
import colors from '../../constants/colors';
import { Svgs } from '../../assets/icons';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Header,
  LiquidGlassBackground,
  LanguageDropdown,
  CustomDropdown,
  Input,
} from '../../components/ui';
import { Images } from '../../assets/images';
import { SelectVedioDescription } from '../vedioDub';
import { useTranslation } from 'react-i18next';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Signup'
>;

export default function CharacherReader() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'CharacherReader'>>();
  const { character, body, hair, accessories, background, emotion } = route.params;
  // State for all dropdowns
  const { t } = useTranslation();

  const [selectedVoiceTone, setSelectedVoiceTone] = useState('');

  const [speed, setSpeed] = useState('');
  const [messsage, setMessage] = useState('');

  // Options for all dropdowns

  const voiceToneOptions = useMemo(
    () => [
      t('characterReader.voiceTones.friendly'),
      t('characterReader.voiceTones.professional'),
      t('characterReader.voiceTones.casual'),
      t('characterReader.voiceTones.energetic'),
      t('characterReader.voiceTones.calm'),
    ],
    [t],
  );
  const speedOptions = useMemo(
    () =>
      (t('characterReader.speedOptions', {
        returnObjects: true,
      }) as string[]) ?? ['1x', '1.5x', '2x'],
    [t],
  );

  // Handler functions for all dropdowns

  const handleVoiceToneSelect = (voiceTone: string) => {
    setSelectedVoiceTone(voiceTone);
  };
  const handlSpeed = (hairStyle: string) => {
    setSpeed(hairStyle);
  };

  return (
    <ScreenBackground style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header
          title={t('characterReader.headerTitle')}
          showBackButton
          RigthIcon={
            <Svgs.HistoryIcon
              height={metrics.width(20)}
              width={metrics.width(20)}
            />
          }
        />
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dashboardContainer}>
            <Text style={styles.title}>{t('characterReader.title')}</Text>
            <Text style={styles.subTitle}>
              {t('characterReader.subtitle')}
            </Text>
            <View style={styles.tempCharacherContainer}>
              <Input
                label={t('characterReader.messageLabel')}
                value={messsage}
                onChangeText={setMessage}
                placeholder={t('characterReader.messagePlaceholder')}
                containerStyle={{height: metrics.width(120),alignItems:'flex-start'}}
              />
              <CustomDropdown
                title={t('characterReader.dropdowns.voiceToneTitle')}
                options={voiceToneOptions}
                selectedValue={selectedVoiceTone}
                onSelect={handleVoiceToneSelect}
                placeholder={t('characterReader.dropdowns.voiceTonePlaceholder')}
              />
              <CustomDropdown
                title={t('characterReader.dropdowns.voiceSpeedTitle')}
                options={speedOptions}
                selectedValue={speed}
                onSelect={handlSpeed}
                placeholder={t('characterReader.dropdowns.voiceSpeedPlaceholder')}
              />
            </View>
          </View>
        </ScrollView>
        
        <PrimaryButton
          title={t('characterReader.buttonPreview')}
          onPress={() => navigation.navigate('PreviewCharacherVedio',{character: character,body: body,hair: hair,accessories: accessories,background: background,emotion: emotion,message: messsage,speed: speed,voiceTone: selectedVoiceTone})}
          variant="primary"
          style={{
            marginBottom: metrics.width(25),
          }}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    marginHorizontal: metrics.width(25),
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: metrics.width(17),
    marginHorizontal: metrics.width(25),
  },
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: metrics.width(10),
  },
  title: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
  },
  subTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(15),
    color: colors.subtitle,
    marginBottom: metrics.width(30),
  },
  profileImage: {
    width: metrics.width(48),
    height: metrics.width(48),
    borderRadius: 100,
    overflow: 'hidden',
  },
  profileImageBackground: {},
  headerLeftContainerText: {
    gap: metrics.width(4),
  },
  headerRightContainer: {
    gap: metrics.width(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRightIconBackground: {
    padding: metrics.width(10),
  },
  dashboardContainer: {
    flex: 1,
    marginTop: metrics.width(30),
  },
  dashboardCard: {
    paddingHorizontal: metrics.width(16),
    paddingVertical: metrics.width(22),
    borderRadius: 12,
    backgroundColor: colors.white15,
  },
  ProPlanIconImage: {
    width: metrics.width(50),
    height: metrics.width(50),
    resizeMode: 'contain',
  },
  ProPlanIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: metrics.width(10),
  },
  ProPlanTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(15),
    color: colors.white,
  },
  propPlanIconTextContainer: {
    gap: metrics.width(15),
    color: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ProPlanSubTitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(11),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  upgradeButton: {},
  button: {
    borderRadius: 8,
    paddingHorizontal: metrics.width(15),
  },
  debugCotainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(40),
  },
  debugTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(20),
    color: colors.white,
    lineHeight: metrics.width(27),
  },
  debuggingSubtitle: {
    fontFamily: FontFamily.spaceGrotesk.regular,
    fontSize: metrics.width(13),
    color: colors.subtitle,
    marginTop: metrics.width(4),
  },
  row: {
    flexDirection: 'row',
    marginTop: metrics.width(11),
    marginBottom: metrics.width(70),
  },
  createButton: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(12),
    color: colors.white,
  },
  vedioIcon2: {
    height: metrics.width(150),
    width: metrics.width(150),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: 0,
  },
  characherIcon: {
    height: metrics.width(200),
    width: metrics.width(200),
    alignSelf: 'flex-end',
    position: 'absolute',
    bottom: -25,
    right: -15,
  },
  createButtonContainer: {
    backgroundColor: colors.primary,
    paddingHorizontal: metrics.width(13),
    paddingVertical: metrics.width(6),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  CharacterCreationContainer: {
    paddingHorizontal: metrics.width(17),
    paddingVertical: metrics.width(20),
    marginTop: metrics.width(9),
    borderWidth: 0.8,
    borderColor: colors.primary40,
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: -12,
    },
    shadowOpacity: 0.1,
    shadowRadius: 0.1,

    elevation: 7,
    backgroundColor: colors.primary3,
  },
  columnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: metrics.width(15),
  },
  tempCharacherTitle: {
    fontFamily: FontFamily.spaceGrotesk.bold,
    fontSize: metrics.width(16),
    color: colors.white,
    marginTop: metrics.width(10),
    margin: metrics.width(10),
  },
  tempCharacher: {
    height: metrics.screenWidth * 0.41,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    flex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
  },
  tempCharacherImage: {
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  selectedCharacter: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  tempCharacherContainer: {},
  textContainer: {
    gap: metrics.width(5),
  },
  vedioIcon: {
    height: metrics.width(50),
    width: metrics.width(50),
  },
  dot: {
    height: metrics.width(5),
    width: metrics.width(5),
    borderRadius: 100,
    backgroundColor: colors.subtitle,
  },
});
