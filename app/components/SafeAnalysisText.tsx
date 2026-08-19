import type { ReactNode } from 'react';

interface SafeAnalysisTextProps {
  content: string;
}

export default function SafeAnalysisText({ content }: SafeAnalysisTextProps) {
  return (
    <div className="space-y-2 text-gray-200">
      {content.split('\n').map((rawLine, index) => {
        const line = rawLine.trimEnd();

        if (line.startsWith('### ')) {
          return (
            <h3 key={index} className="pt-3 text-lg font-semibold text-neon-cyan">
              {renderInlineText(line.slice(4))}
            </h3>
          );
        }

        if (line.startsWith('## ')) {
          return (
            <h2 key={index} className="pt-4 text-xl font-bold text-neon-magenta">
              {renderInlineText(line.slice(3))}
            </h2>
          );
        }

        if (!line) {
          return <div key={index} className="h-2" aria-hidden="true" />;
        }

        return (
          <p key={index} className="leading-7 text-gray-300">
            {renderInlineText(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInlineText(value: string): ReactNode[] {
  return value.split(/(\*\*.*?\*\*)/g).filter(Boolean).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-neon-yellow">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return part;
  });
}
