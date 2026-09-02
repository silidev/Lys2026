const FILE_PATH = 'common/longPressTooltip/hooks/useLongPressDebug.ts';
import { useEffect } from 'react';

const getElementInfo = (element: HTMLElement): string => {
  const info: string[] = [];
  const nameInCode = element.dataset.nameInCode || (element.id ? `#${element.id}` : `<${element.tagName.toLowerCase()}>`);
  info.push(`Name in source code: ${nameInCode}`);
  
  const title = element.title;
  if (title) {
    info.push(`Help Text: ${title}`);
  } else {
    info.push(`Help Text: (not set)`);
  }

  return info.join('\n');
};

export const useLongPressDebug = () => {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      // For developers: Alt+Shift+Right-click to inspect an element
      if (!e.altKey || !e.shiftKey) return;
      
      e.preventDefault();
      
      const target = e.target as HTMLElement;
      // Traverse up to find the closest element with an ID or a button/a tag
      let el: HTMLElement | null = target;
      while (el && !el.id && !['BUTTON', 'A', 'SELECT', 'INPUT', 'TEXTAREA'].includes(el.tagName)) {
        el = el.parentElement;
      }
      
      if (el) {
        const info = getElementInfo(el);
        alert(info);
      } else {
        alert("Could not identify a primary interactive element.");
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
};
