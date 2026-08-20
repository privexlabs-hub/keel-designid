/**
 * Slug to content component. Keeping the map here means the route file is a
 * lookup and nothing else, and an unmapped section fails loudly at build.
 */
import type { ComponentType } from 'react';
import { IntroductionContent } from './introduction';
import { LogoContent } from './logo';
import { MisuseContent } from './misuse';
import { ColourContent } from './colour';
import { TypographyContent } from './typography';
import { IconographyContent } from './iconography';
import { VoiceContent } from './voice';
import { LayoutContent } from './layout';
import { MotionContent } from './motion';
import { ApplicationContent } from './application';
import { DownloadsContent } from './downloads';

export const CONTENT: Record<string, ComponentType> = {
  introduction: IntroductionContent,
  logo: LogoContent,
  'logo-misuse': MisuseContent,
  colour: ColourContent,
  typography: TypographyContent,
  iconography: IconographyContent,
  'voice-and-tone': VoiceContent,
  layout: LayoutContent,
  motion: MotionContent,
  application: ApplicationContent,
  downloads: DownloadsContent,
};
