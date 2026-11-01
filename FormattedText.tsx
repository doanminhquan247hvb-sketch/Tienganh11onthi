import React from 'react';

interface FormattedTextProps {
  text: string;
  className?: string;
  underlineClassName?: string;
}

/**
 * Parses text containing HTML <u>...</u>, [u]...[/u], or markdown _..._ (when in pronunciation context)
 * and renders it with beautiful, accessible underline styling so students can clearly see the tested letters.
 */
export const FormattedText: React.FC<FormattedTextProps> = ({
  text,
  className = '',
  underlineClassName = 'underline underline-offset-4 decoration-indigo-600 decoration-[2.5px] font-bold text-indigo-950',
}) => {
  if (!text) return null;

  // Split by <u>...</u> or [u]...[/u]
  const regex = /(<u>[\s\S]*?<\/u>|\[u\][\s\S]*?\[\/u\])/gi;
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        const uMatch = part.match(/^<u>([\s\S]*?)<\/u>$/i);
        if (uMatch) {
          return (
            <span key={index} className={underlineClassName}>
              {uMatch[1]}
            </span>
          );
        }

        const bracketMatch = part.match(/^\[u\]([\s\S]*?)\[\/u\]$/i);
        if (bracketMatch) {
          return (
            <span key={index} className={underlineClassName}>
              {bracketMatch[1]}
            </span>
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
