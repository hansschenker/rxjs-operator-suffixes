import './styles.css';
import { interval, map, takeUntil, tap } from 'rxjs';
import { fromEvent } from 'rxjs';

const output = document.querySelector<HTMLParagraphElement>('#output');
const stopButton = document.querySelector<HTMLButtonElement>('#stop');

const stopClicks$ = fromEvent(stopButton ?? document, 'click');

interval(1000)
  .pipe(
    map((count) => count + 1),
    tap((value) => {
      if (output) {
        output.textContent = `Next value: ${value}`;
      }
    }),
    takeUntil(stopClicks$)
  )
  .subscribe({
    complete: () => {
      if (output) {
        output.textContent = 'Stream stopped.';
      }
    },
  });
