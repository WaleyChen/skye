it1 = {
  id: 1,
  name: "1",
  description: "1",
  tags: [],
  startAfter: 0,
  endBefore: 100,
  dependencies: [],
  duration: 1,
  scheduledStart: 0
}

it2 = {
  id: 2,
  name: "2",
  description: "2",
  tags: [],
  startAfter: 0,
  endBefore: 100,
  dependencies: [],
  duration: 1,
  scheduledStart: 0
}

it3 = {
  id: 3,
  name: "3",
  description: "3",
  tags: [],
  startAfter: 0,
  endBefore: 100,
  dependencies: [],
  duration: 1,
  scheduledStart: 0
}

it4 = {
  id: 4,
  name: "4",
  description: "4",
  tags: [],
  startAfter: 1,
  endBefore: 4,
  dependencies: [],
  duration: 1,
  scheduledStart: 0
}

it5 = {
  id: 5,
  name: "5",
  description: "5",
  tags: [1],
  startAfter: 0,
  endBefore: 3,
  dependencies: [],
  duration: 2,
  scheduledStart: 0
}

t0 = {
	id: 0,
	name: "t0",
	"priority": 0
}

t1 = {
	id: 1,
	name: "t1",
	"priority": 1
}

t2 = {
	id: 2,
	name: "t2",
	"priority": 2
}

t3 = {
	id: 3,
	name: "t3",
	"priority": 3
}

var tags = [t0,t1,t2,t3];

//Utilities

var between = function (arg, first, last) {
	return (arg >= first && arg <= last)
}

var freeTimes = function (schedule, startTime, endTime) {
	timePairs = [[startTime, endTime]];
	for (var i = 0; i < schedule.length; i++) {
		oldTimes = timePairs;
		timePairs = [];
		curEvent = schedule[i];
		while (timePair = oldTimes.pop()) {
			//event is entirely before pair
			if (curEvent.scheduledStart + curEvent.duration < timePair[0]) {
				timePairs.push(timePair);
				continue;
			}
			//event is completely after pair
			if  (curEvent.scheduledStart > timePair[1]) {
				timePairs.push(timePair);
				continue;
			}
			//event is within pair
			if (curEvent.scheduledStart > timePair[0] && curEvent.scheduledStart + curEvent.duration < timePair[1]) {
				timePairs.push([timePair[0],curEvent.scheduledStart - 1]);
				timePairs.push([curEvent.scheduledStart + curEvent.duration + 1, timePair[1]]);
				continue;
			}
			//event covers start of pair only
			if (curEvent.scheduledStart <= timePair[0] && curEvent.scheduledStart + curEvent.duration < timePair[1]) {
				timePairs.push([curEvent.scheduledStart + curEvent.duration + 1, timePair[1]]);
				continue;
			}
			//event covers end of pair only
			if (curEvent.scheduledStart > timePair[0] && curEvent.scheduledStart + curEvent.duration >= timePair[1]) {
				timePairs.push([timePair[0], curEvent.scheduledStart]);
				continue;
			}
			//event completely covers pair
			if (curEvent.scheduledStart <= timePair[0] && curEvent.scheduledStart + curEvent.duration >= timePair[1]) {
				continue;
			}
			alert("Strange condition in finding free times (may have things that are equal to each other");
		};
	};
	return timePairs;
}

var priority = function (task) {
	maxPriority = 0;
	for (var i = 0; i < task.tags.length; i++) {
		tag = task.tags[i];
		maxPriority = Math.max(maxPriority, tags[tag].priority);
	}
	return maxPriority;
}

var sortBySchedulingDifficulty = function(tasks) {
	tasks.sort(function (left,right) {
		if (left.duration < right.duration) {
			return false;
		} else if (left.duration > right.duration) {
			return true;
		} else if (left.endBefore - left.startAfter < right.endBefore - right.startAfter) {
			return false;
		} else {
			return true;
		}
	});
}

///////////////////
//Task related utilities
///////////////////

//does not recieve ownership of tasks.
var interferes = function(task1, task2) {
	if (between(task1.scheduledStart, task2.scheduledStart, task2.scheduledStart + task2.duration)) {
		return true;
	} else if (between(task1.scheduledStart + task1.duration, task2.scheduledStart, task2.scheduledStart + task2.duration)) {
		return true;
	}
	return false;
}

//Takes a task and either puts in into unschedulable or tasks (maybe after modifications)
var makeValid = function (unschedulable, tasks, task) {
	if (task.endBefore - task.startAfter < task.duration) {
		unschedulable.push(task);
		return;
	}
	if (task.scheduledStart < task.startAfter || task.scheduledStart + task.duration > task.endBefore) {
		task.scheduledStart = task.startAfter;
	}
	tasks.push(task);
}

//Takes a task and either inserts it into the schedule or into unscheduled and returns whether or not is succeeded (where success is putting the task in the schedule)
var tryInsertWithMovedStart = function (schedule, unscheduled, task) {
	timePairs = freeTimes(schedule, task.startAfter, task.endBefore);
	while(timePair = timePairs.pop()) {
		if (timePair[1] - timePair[0] >= task.duration) {
			task.scheduledStart = timePair[0];
			schedule.push(task);
			return true;
		}
	}
	unscheduled.push(task);
	return false;
}

//Takes a task and either puts it in unscheduled if it couldn't be fit, or puts the task in the schedule (possibly moving events from schedule to unscheduled)
var tryInsertWithOneMovedEvent = function(schedule, unscheduled, task){
	for (var i = 0; i < schedule.length; i++) {
		item = schedule.splice(i, 1);
		item = item[0];
		if (priority(item) > priority(task)) {
			schedule.splice(i, 0, item);
			continue;
		}
		success = tryInsertWithMovedStart(schedule, unscheduled, task);
		if (success) {
			unscheduled.push(item);
			return;
		} else {
			schedule.splice(i, 0, item);
			unscheduled.pop();
		}
	}
	if (task !== undefined) {
		unscheduled.push(task);
	}
}

//Takes a task and either puts it in scheduled or puts it in unscheduled (possibly bumping lower priority tasks into unscheduled in the process [yes, even if it fails])
var tryInsertWithBump = function(schedule, unscheduled, task) {
	for (var i = 0; i < schedule.length; i++) {
		curEvent = schedule[i];
		if (interferes(curEvent, task) && priority(curEvent) < priority(task)) {
			item = schedule.splice(i, 1);
			item = item[0];
			unscheduled.push(item);
		}
	}
	tryInsertWithOneMovedEvent(schedule, unscheduled, task);
}

tasks = [it1, it2, it3, it4, it5];
sortBySchedulingDifficulty(tasks);
unscheduled = []
unschedulable = [];
schedule = [];

//make all tasks valid, and moves tasks that can't be made valid to unschedulable
unscheduled = tasks;
tasks = [];
while (task = unscheduled.pop()) {
	makeValid(unschedulable, tasks, task);
};

//if possible, move a task around to fit it in the graph
while (task = tasks.pop()) {
	tryInsertWithMovedStart(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];
sortBySchedulingDifficulty(tasks);

//try removing singular events to make room for the remaining tasks
while (task = tasks.pop()) {
	tryInsertWithOneMovedEvent(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];
sortBySchedulingDifficulty(tasks);

//try again to insert with moved start, to put back any that were removed in previous section
while (task = tasks.pop()) {
	tryInsertWithMovedStart(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];
sortBySchedulingDifficulty(tasks);

//Move lower priority tasks out of the way.
while (task = tasks.pop()) {
	tryInsertWithBump(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];
sortBySchedulingDifficulty(tasks);

//Put back all the bumped tasks with low priority
while (task = tasks.pop()) {
	tryInsertWithOneMovedEvent(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];
sortBySchedulingDifficulty(tasks);

//Put back all moved tasks from previous
while (task = tasks.pop()) {
	tryInsertWithMovedStart(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];
sortBySchedulingDifficulty(tasks);

//give up
unschedulable = unschedulable.concat(tasks);
tasks = [];