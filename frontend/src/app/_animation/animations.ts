import { animate, AnimationEntryMetadata, state, style, transition, trigger } from '@angular/core';

// export function openPage() {
//     return openPages();
// };

// export function showHide() {
//     return showHides();
// };


export function openPage() {
    return trigger(
        'openPage',
        [
            transition(":enter", [
                style({ opacity: 0 }),
                animate('500ms', style({ opacity: 1 }))
            ])
        ]);
};


export function showHide() {
    return trigger(
        'showHide',
        [
            transition(':enter', [  // before 2.1: transition('void => *', [
                style({ transform: 'translateY(100%)', opacity: 0 }),
                animate('0.5s ease-in-out',
                    style({ transform: 'translateY(0%)', opacity: 1 }))
            ]),
            transition(':leave', [  // before 2.1: transition('* => void', [
                style({ transform: 'translateY(0%)', opacity: 1 }),
                animate('0.5s ease-in-out',
                    style({ transform: 'translateY(-100%)', opacity: 0 }))
            ])
        ]);

};
