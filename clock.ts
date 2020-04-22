namespace game {
    const CLOCK_DATA = "clock_data"
    class Schedule {
        handler: () => void;
        time: number; // time in millisecond when the schedule triggers
    }
    class ClockData {
        // we need to recycle schedules because we can't unregister them...
        schedules: Schedule[];
        constructor() {
            this.schedules = [];
        }

        update(time: number) {
            for(const sc of this.schedules) {
                if (sc.handler && time >= sc.time) {
                    const h = sc.handler;
                    sc.handler = undefined;
                    h();
                }
            }
        }

        private findSchedule(a: () => void): Schedule {
            for (const sc of this.schedules) {
                if (sc.handler == a)
                    return sc;
            }
            return undefined;
        }

        private allocSchedule(): Schedule {
            for (const sc of this.schedules) {
                if (!sc.handler)
                    return sc;
            }
            const nsc = new Schedule();
            this.schedules.push(nsc);
            return nsc;
        }

        schedule(handler: () => void, unique: boolean, time: number) {
            let sc: Schedule = undefined;
            if(unique)
                sc = this.findSchedule(handler);
            if (!sc)
                sc = this.allocSchedule();
            sc.handler = handler;
            sc.time = time;
        }
    }

    /**
     * Schedule code to be run after a delay.
     */
    //% group="Gameplay" weight=10
    //% blockId="gameschedule" block="schedule update unique $unique after $delay (ms)"
    //% unique.shadow=toggleYesNo
    //% delay.shadow=timePicker
    export function scheduleUpdate(unique: boolean, delay: number, handler: () => void) {
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
        data.schedule(handler, unique, sc.millis() + delay);
    }
}