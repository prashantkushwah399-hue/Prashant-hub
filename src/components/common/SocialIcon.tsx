import {
  Globe,
  Link2,
  MessageCircle,
  Send,
  Share2,
  Terminal,
  Video,
  Camera,
} from 'lucide-react';
import type { SocialPlatform } from '../../types/models';

export function SocialIcon({
  platform,
  className = 'w-4 h-4',
}: {
  platform: SocialPlatform | string;
  className?: string;
}) {
  switch (platform) {
    case 'YouTube':
      return <Video className={className} />;
    case 'Instagram':
      return <Camera className={className} />;
    case 'GitHub':
      return <Terminal className={className} />;
    case 'Telegram':
      return <Send className={className} />;
    case 'Discord':
      return <MessageCircle className={className} />;
    case 'Website':
      return <Globe className={className} />;
    case 'X':
    case 'LinkedIn':
      return <Share2 className={className} />;
    default:
      return <Link2 className={className} />;
  }
}
