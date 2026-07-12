// submissionQueue.js
// Lightweight in-process FIFO job queue, concurrency = 1.
//
// Why this exists: every code submission/run spawns a `docker run`
// process. On a 1GB free-tier EC2 box, more than one or two of these
// running at once causes OOM crashes during a live contest. This queue
// guarantees only ONE Docker execution is ever in flight at a time,
// system-wide, no matter how many HTTP requests arrive concurrently.
//
// Deliberately zero external dependencies (no Redis, no better-queue).
// Just a plain array + a "busy" flag. Every job is wrapped in
// try/catch/finally so a single failing/throwing job can NEVER wedge
// the queue — the next job always gets picked up.

class SubmissionQueue {
    constructor() {
        this.queue = [];       // pending jobs, FIFO
        this.isProcessing = false; // true while a job is actively running
    }

    /**
     * Adds a job to the queue.
     * @param {() => Promise<any>} task - async function that does the work
     *        (e.g. runs Docker and updates the DB).
     * @returns {Promise<any>} resolves/rejects when the job finishes.
     *        Callers can `await` this if they need the result (e.g. the
     *        "run code" endpoint), or ignore the returned promise for a
     *        true fire-and-forget submit.
     */
    enqueue(task) {
        return new Promise((resolve, reject) => {
            this.queue.push({ task, resolve, reject });
            this._processNext();
        });
    }

    // How many jobs are waiting or currently running. Useful for a
    // "you are #4 in the queue" style status message later if you want it.
    get pendingCount() {
        return this.queue.length + (this.isProcessing ? 1 : 0);
    }

    async _processNext() {
        if (this.isProcessing) return; // something is already running — wait
        const job = this.queue.shift();
        if (!job) return; // queue is empty, nothing to do

        this.isProcessing = true;

        try {
            const result = await job.task();
            job.resolve(result);
        } catch (error) {
            // Log it, but DO NOT rethrow past this point — that would
            // leave isProcessing stuck at true and freeze the whole queue
            // for every submission after it.
            console.error("SubmissionQueue: job failed:", error?.message || error);
            job.reject(error);
        } finally {
            this.isProcessing = false;
            // setImmediate instead of a direct recursive call — keeps the
            // call stack flat even if hundreds of jobs are queued back to
            // back during a contest rush.
            setImmediate(() => this._processNext());
        }
    }
}

// One shared instance for the entire app. Import this same object
// everywhere so all Docker executions (submit + run) share one queue.
const submissionQueue = new SubmissionQueue();

export default submissionQueue;