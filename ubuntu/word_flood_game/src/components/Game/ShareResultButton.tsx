import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check } from 'lucide-react';
import { ShareableResult } from '../../types';

interface ShareResultButtonProps {
  result: ShareableResult;
  className?: string;
}

const ShareResultButton: React.FC<ShareResultButtonProps> = ({ result, className = '' }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const getScoreEmoji = (score: number): string => {
    if (score >= 500) return '🏆';
    if (score >= 300) return '🌟';
    if (score >= 150) return '⭐';
    return '📊';
  };

  const getWordsEmoji = (count: number): string => {
    if (count >= 30) return '📚';
    if (count >= 20) return '📖';
    if (count >= 10) return '📝';
    return '✏️';
  };

  const getLongestWordEmoji = (length: number): string => {
    if (length >= 8) return '🎯';
    if (length >= 6) return '💎';
    return '💡';
  };

  const generateShareText = (): string => {
    const lines: string[] = [];

    // Title with flag
    lines.push(`${t('share.title')} ${result.language === 'da' ? '🇩🇰' : '🇬🇧'}`);
    lines.push('');

    // Stats with emojis
    lines.push(`${getScoreEmoji(result.score)} ${t('share.score', { score: result.score })}`);
    lines.push(`${getWordsEmoji(result.wordCount)} ${t('share.words', { count: result.wordCount })}`);

    if (result.longestWord) {
      lines.push(`${getLongestWordEmoji(result.longestWord.length)} ${t('share.longestWord', { word: result.longestWord })}`);
    }

    lines.push('');
    lines.push(`🎮 ${t('share.playNow')}`);

    return lines.join('\n');
  };

  const handleShare = async () => {
    const shareText = generateShareText();

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: t('share.title'),
          text: shareText,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className={`flex items-center justify-center gap-2 px-6 py-3
        bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700
        text-white font-semibold rounded-xl shadow-lg hover:shadow-xl
        transition-all ${className}`}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="copied"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            <Check size={20} />
            {t('share.copied')}
          </motion.div>
        ) : (
          <motion.div
            key="share"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center gap-2"
          >
            {'share' in navigator ? <Share2 size={20} /> : <Copy size={20} />}
            {t('share.button')}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default ShareResultButton;
