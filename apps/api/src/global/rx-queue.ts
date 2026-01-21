import {
    BehaviorSubject,
    catchError,
    debounceTime,
    forkJoin,
    Observable,
    ReplaySubject,
    Subject,
    takeUntil,
    tap
} from "rxjs";

export type QueueTask<T> = [string, Observable<T>];
export type QueueTaskResult<T> = [string, T];

export class RxQueue<T> {
    private queued: QueueTask<T>[] = [];
    private execCompleted = new Subject<void>();
    queueResult = new Subject<QueueTaskResult<T>>();
    private cancelReplay = new ReplaySubject<boolean>(1);
    tasksPerStep: number;
    private running: boolean = false;

    constructor(timeGapBetweenTasks: number = 100, tasksPerStep: number = 1) {
        this.tasksPerStep = tasksPerStep;
        this.execCompleted.pipe(
            debounceTime(timeGapBetweenTasks)
        )
            .subscribe(() => this.exec());
    }

    private exec() {
        const currentTasks = this.queued.splice(0, this.tasksPerStep);
        if (currentTasks.length === 0) {
            this.running = false;
            return;
        }
        this.running = true;
        const tasksObj: Record<string, Observable<T>> = {};
        currentTasks.forEach(task => tasksObj[task[0]] = task[1]);
        forkJoin(
            tasksObj
        )
            .pipe(
                takeUntil(this.cancelReplay),
                tap(results => {
                    [...Object.keys(results)]
                        .forEach((task) => this.queueResult.next([task, results[task]]))
                }),
                tap(() => {
                    this.execCompleted.next();
                }),
                catchError((err) => {
                    this.queueResult.error(new Error('Error occurred while executing queue task'));
                    this.execCompleted.next();
                    return [];
                })
            )
            .subscribe();
    }

    addTask(name: string, task: Observable<T>) {
        this.queued.push([name, task]);
        if (!this.running) this.exec();
    }

    removeTask(name: string) {
        this.queued = this.queued.filter(task => task[0] !== name);
    }

    flushTasks() {
        this.queued = [];
    }

    cancelRunning() {
        this.cancelReplay.next(true);
        this.cancelReplay = new ReplaySubject<boolean>(1);
        this.running = false;
        this.execCompleted.next();
    }

    cancelAll() {
        this.flushTasks();
        this.cancelRunning();
    }
}