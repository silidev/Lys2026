const FILE_PATH = 'components/ClickableText.tsx';
import React from 'react';

interface ClickableTextProps {
  text: string;
}

const ClickableText: React.FC<ClickableTextProps> = ({ text }) => {
  const urlRegex = /(\bhttps?:\/\/\S+|\b[a-zA-Z][a-zA-Z0-9+-.]*:\/\/\S+|\bwww\.\S+)/gi;
  const parts = text.split(urlRegex);

  return (
    <>
      {parts.map((part, index) => {
        if (part && part.match(urlRegex)) {
          let href = part;
          if (part.toLowerCase().startsWith('www.')) {
            href = `http://${part}`;
          }
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:underline dark:text-orange-400"
              onClick={(e) => {
                // Allow default browser action for the link, but stop propagation
                // to prevent parent onClick handlers (like toggling item completion)
                // from firing.
                e.stopPropagation();
              }}
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};

export default ClickableText;