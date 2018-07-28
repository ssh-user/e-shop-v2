class Timer {
    constructor(hour, callback) {
        this.hour = (hour < 10) ? `0${hour}` : `${hour}`;
        this.callback = callback;
    };

    start() {
        setInterval(() => {
            if (this.checkTime()) {
                this.callback();
            };
        }, 1000 * 60 * 60); // every hour 
    };

    checkTime() {
        let date = new Date().toTimeString().substring(0, 2);
        if (this.hour == date) return true;
        else return false;
    };
};

module.exports = Timer;