const FILE_PATH = 'common/longPressTooltip/types/index.ts';
import type React from 'react';

export interface TooltipContent {
  helpText: string;
  nameInCode?: string;
}

export interface TooltipData {
  content: TooltipContent;
  targetRect: DOMRect;
}

export type LongPressEventHandlers = {
    onTouchStart: React.TouchEventHandler<HTMLElement>;
    onTouchEnd: React.TouchEventHandler<HTMLElement>;
    onTouchMove: React.TouchEventHandler<HTMLElement>;
    onTouchCancel: React.TouchEventHandler<HTMLElement>;
    onMouseDown: React.MouseEventHandler<HTMLElement>;
    onMouseUp: React.MouseEventHandler<HTMLElement>;
    onMouseLeave: React.MouseEventHandler<HTMLElement>;
    onContextMenu: React.MouseEventHandler<HTMLElement>;
};
