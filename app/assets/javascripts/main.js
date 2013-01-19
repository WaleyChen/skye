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
  endBefore: 3,
  dependencies: [],
  duration: 1,
  scheduledStart: 0
}

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

//Takes a task and either inserts it into the schedule or into unscheduled.
var tryInsert = function (scheduled, unscheduled, task) {
	for (var i = 0; i < schedule.length; i++) {
		curEvent = scheduled[i];
		if (interferes(task, curEvent)) {
			unscheduled.push(task);
			return;
		}
	}
	scheduled.push(task);
	return;
}

//Takes a task and either inserts it into the schedule or into unscheduled and returns whether or not is succeeded (where success is putting the task in the schedule)
var tryInsertWithMovedStart = function (schedule, unscheduled, task) {
	timePairs = freeTimes(schedule, task.startAfter, task.endBefore);
	while(timePair = timePairs.pop()) {
		if (timePair[1] - timePair[0] > task.duration) {
			task.scheduledStart = timePair[0];
			schedule.push(task);
			return true;
		}
	}
	unscheduled.push(task);
	return false;
}

//Takes a task and either returns it if it couldn't be fit, or returns undefined, and puts the task in the schedule (possibly moving events from schedule to unscheduled)
var tryInsertWithOneMovedEvent = function(schedule, unscheduled, task){
	for (var i = 0; i < schedule.length; i++) {
		item = schedule.splice(i, 1);
		item = item[0];
		success = tryInsertWithMovedStart(schedule, unscheduled, task);
		if (success) {
			unscheduled.push(item);
			return;
		} else {
			schedule.splice(i, 0, item);
			unscheduled.pop();
		}
	}
	return task;
}

tasks = [it1, it2, it3, it4];
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
unscheduled = []
unschedulable = [];
schedule = [];

//make all tasks valid, and moves tasks that can't be made valid to unschedulable
unscheduled = tasks;
tasks = [];
while (task = unscheduled.pop()) {
	makeValid(unschedulable, tasks, task);
};

//insert into schedule niavely (make no attempt to account for properties of task and insert tasks in the order they appear if there is room)
while (task = tasks.pop()) {
	tryInsert(schedule, unscheduled, task);
};

tasks = unscheduled;
unscheduled = [];

//if possible, move a task around to fit it in the graph
while (task = tasks.pop()) {
	tryInsertWithMovedStart(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];

//try removing singular events to make room for the remaining tasks
while (task = tasks.pop()) {
	task = tryInsertWithOneMovedEvent(schedule, unscheduled, task);
	if (task !== undefined) {
		unscheduled.push(task);
	}
}

tasks = unscheduled;
unscheduled = [];

//try again to insert with moved start, to put back any that were removed in previous section
while (task = tasks.pop()) {
	tryInsertWithMovedStart(schedule, unscheduled, task);
}

tasks = unscheduled;
unscheduled = [];

//give up
unschedulable = unschedulable.concat(tasks);
tasks = [];