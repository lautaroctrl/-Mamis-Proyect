(function exposeTimeUtils(global) {
    const toMinutes = (schedule) => {
        if (!schedule || !schedule.includes(':')) {
            return -1;
        }

        const [hour, minute] = schedule.split(':').map(Number);
        if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
            return -1;
        }

        return (hour * 60) + minute;
    };

    const getArgentinaTime = () => {
        const parts = new Intl.DateTimeFormat('es-AR', {
            timeZone: 'America/Argentina/Buenos_Aires',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).formatToParts(new Date());

        const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
        const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);

        return {
            hora: hour,
            minuto: minute,
            minutosTotales: (hour * 60) + minute
        };
    };

    const isResetWindow = () => getArgentinaTime().hora >= 23;

    const isPastSchedule = (schedule) => {
        if (isResetWindow()) {
            return false;
        }

        const scheduleInMinutes = toMinutes(schedule);
        if (scheduleInMinutes < 0) {
            return true;
        }

        return scheduleInMinutes < getArgentinaTime().minutosTotales;
    };

    global.TimeUtils = {
        toMinutes,
        getArgentinaTime,
        isResetWindow,
        isPastSchedule
    };
})(window);
