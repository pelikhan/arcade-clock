namespace game {
    const CLOCK_DATA = "clock_data"
    class Schedule {
        constructor(
            public handler: () => void, 
            public time: number) {
        }
    }
    class ClockData {
        // we need to recycle schedules because we can't unregister them...
        schedules: Schedule[];
        constructor() {
            this.schedules = [];
        }

        update(time: number) {
            let cleared = false;
            for(const sc of this.schedules) {
                if (sc.handler && time >= sc.time) {
                    const h = sc.handler;
                    sc.handler = undefined;
                    cleared = true;
                    h();
                }
            }
            // delete unused schedulers
            if (cleared)
                this.schedules = this.schedules.filter(sc => !!sc.handler);
        }

        schedule(handler: () => void, time: number) {
            this.schedules.push(new Schedule(handler, time));
        }
    }

    /**
     * Schedule code to be run after a delay on game update.
     */
    //% group="Gameplay" weight=10
    //% blockId="gameschedule" block="run on game update after $delay (ms)"
    //% delay.shadow=timePicker
    //% handlerStatement=1 weight=81
    export function runOnUpdateAfter(delay: number, handler: () => void) {
        if (!handler || delay < 0) return;
        const sc = game.currentScene();
        let data = sc.data[CLOCK_DATA] as ClockData;
        if (!data) {
            data = sc.data[CLOCK_DATA] = new ClockData();
            const ctx = game.eventContext();
            ctx.registerFrameHandler(scene.UPDATE_INTERVAL_PRIORITY, () => {
                const time = sc.millis()
                data.update(time);
            });
        }

        // schedule it
        data.schedule(handler, sc.millis() + delay);
    }
}