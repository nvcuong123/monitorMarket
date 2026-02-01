import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import schedule from "node-schedule";

console.log("Script started. Waiting for scheduled time...");

schedule.scheduleJob(
  { hour: 12, minute: 17, tz: "Asia/Ho_Chi_Minh" },
  function () {
    console.log("Scheduled task executed at:", new Date().toString());
  }
);

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Jakarta"); // Set UTC+7 as default timezone

const MINUTE_5 = 5 * 60 * 1000; // 5 minutes in milliseconds
const CLEANUP_SIGNALS_INTERVAL = MINUTE_5;

async function startCleanupSignals() {
  async function cleanUpSignals() {
    console.log("cleanUpSignals:start", dayjs().format("HH:mm:ss:SSS"));
    // cleanUpSignalList(realTime.subtract(2,"day"));
    // cleanUpSignalList(dayjs().subtract(10, "minute"));
    console.log("cleanUpSignals:finish", dayjs().format("HH:mm:ss:SSS"));
  }
  // next time point to cleanup
  let nextTimepointCleanUp = dayjs().startOf("day").hour(20).minute(49);
  if (dayjs().isAfter(nextTimepointCleanUp)) {
    nextTimepointCleanUp = nextTimepointCleanUp.add(1, "day");
  }
  console.log(
    "startCleanupSignals:nextTimepointCleanUp",
    nextTimepointCleanUp.format("HH:mm:ss:SSS")
  );
  nextTimepointCleanUp = nextTimepointCleanUp.valueOf() - dayjs().valueOf();
  setTimeout(async () => {
    console.log("startCleanupSignals:timeout", dayjs().format("HH:mm:ss:SSS"));
    await cleanUpSignals();
    // then interval cleanup
    setInterval(async () => {
      console.log(
        "startCleanupSignals:interval",
        dayjs().format("HH:mm:ss:SSS")
      );
      await cleanUpSignals();
    }, CLEANUP_SIGNALS_INTERVAL);
  }, nextTimepointCleanUp);
}

startCleanupSignals(); // Call the function to start the cleanup process
