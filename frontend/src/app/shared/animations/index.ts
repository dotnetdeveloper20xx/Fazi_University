import {
  trigger,
  transition,
  style,
  animate,
  query,
  stagger,
  state,
  keyframes,
  group,
  animateChild
} from '@angular/animations';

// ═══════════════════════════════════════════════════════════════
// ENTRANCE ANIMATIONS
// ═══════════════════════════════════════════════════════════════

// Fade in elegantly
export const fadeIn = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0 }))
  ])
]);

// Slide up with fade (perfect for cards, list items)
export const slideUp = trigger('slideUp', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 0, transform: 'translateY(-10px)' }))
  ])
]);

// Slide in from right (for side panels, drawers)
export const slideInRight = trigger('slideInRight', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(100%)' }),
    animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 1, transform: 'translateX(0)' }))
  ]),
  transition(':leave', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({ opacity: 0, transform: 'translateX(100%)' }))
  ])
]);

// Scale in with bounce (for modals, popovers)
export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.9)' }),
    animate('300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      style({ opacity: 1, transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in',
      style({ opacity: 0, transform: 'scale(0.95)' }))
  ])
]);

// ═══════════════════════════════════════════════════════════════
// LIST ANIMATIONS (Staggered)
// ═══════════════════════════════════════════════════════════════

// Staggered list entrance
export const staggeredList = trigger('staggeredList', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger('50ms', [
        animate('400ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

// Staggered grid entrance
export const staggeredGrid = trigger('staggeredGrid', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'scale(0.9)' }),
      stagger('30ms', [
        animate('300ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ], { optional: true })
  ])
]);

// Table rows animation
export const tableRowAnimation = trigger('tableRowAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateX(-10px)' }),
    animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
  ])
]);

// ═══════════════════════════════════════════════════════════════
// STATE ANIMATIONS
// ═══════════════════════════════════════════════════════════════

// Expand/collapse
export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({ height: '0', opacity: 0, overflow: 'hidden' })),
  state('expanded', style({ height: '*', opacity: 1 })),
  transition('collapsed <=> expanded', [
    animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

// Rotate icon (for accordion arrows, etc.)
export const rotateIcon = trigger('rotateIcon', [
  state('default', style({ transform: 'rotate(0deg)' })),
  state('rotated', style({ transform: 'rotate(180deg)' })),
  transition('default <=> rotated', [
    animate('200ms ease-in-out')
  ])
]);

// Highlight pulse (for new items, notifications)
export const highlightPulse = trigger('highlightPulse', [
  transition(':enter', [
    animate('1s ease-in-out', keyframes([
      style({ backgroundColor: 'rgba(59, 130, 246, 0.1)', offset: 0 }),
      style({ backgroundColor: 'rgba(59, 130, 246, 0.1)', offset: 0.7 }),
      style({ backgroundColor: 'transparent', offset: 1 })
    ]))
  ])
]);

// ═══════════════════════════════════════════════════════════════
// MICRO-INTERACTIONS
// ═══════════════════════════════════════════════════════════════

// Button press effect
export const buttonPress = trigger('buttonPress', [
  transition('* => pressed', [
    animate('100ms', style({ transform: 'scale(0.97)' })),
    animate('100ms', style({ transform: 'scale(1)' }))
  ])
]);

// Shake for errors
export const shake = trigger('shake', [
  transition('* => shake', [
    animate('500ms', keyframes([
      style({ transform: 'translateX(0)', offset: 0 }),
      style({ transform: 'translateX(-10px)', offset: 0.2 }),
      style({ transform: 'translateX(10px)', offset: 0.4 }),
      style({ transform: 'translateX(-10px)', offset: 0.6 }),
      style({ transform: 'translateX(10px)', offset: 0.8 }),
      style({ transform: 'translateX(0)', offset: 1 })
    ]))
  ])
]);

// Card hover animation
export const cardHover = trigger('cardHover', [
  state('default', style({ transform: 'translateY(0)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' })),
  state('hovered', style({ transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.15)' })),
  transition('default <=> hovered', [
    animate('200ms cubic-bezier(0.4, 0, 0.2, 1)')
  ])
]);

// ═══════════════════════════════════════════════════════════════
// PAGE TRANSITIONS
// ═══════════════════════════════════════════════════════════════

export const pageTransition = trigger('pageTransition', [
  transition('* <=> *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        width: '100%'
      })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ], { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ], { optional: true })
    ])
  ])
]);

// Content fade transition
export const contentAnimation = trigger('contentAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-out', style({ opacity: 1 }))
  ])
]);
