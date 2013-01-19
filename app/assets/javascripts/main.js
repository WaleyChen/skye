it1 = {
  id: 1
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
  id: 2
  name: "2",
  description: "2",
  tags: [],
  startAfter: 0,
  endBefore: 100,
  dependencies: [],
  duration: 1
  scheduledStart: 0
}

it2 = {
  id: 3
  name: "3",
  description: "3",
  tags: [],
  startAfter: 0,
  endBefore: 100,
  dependencies: [],
  duration: 1
  scheduledStart: 0
}

//Utilities

var between = function (arg, first, last) {
	return (arg > first && arg < last)
}

var freeTimes = function (schedule, startTime, endTime) {
	timePairs = [[startTime, endTime]];
	for (var i = 0; i < schedule.length; i++) {
		oldTimes = times;
		times = [];
		curEvent = schedule[i];
		for (timePair = oldTimes.pop()) {
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
				timePairs.push([timePair[0],curEvent.scheduledStart]);
				timePairs.push([curEvent.scheduledStart + curEvent.duration, timePair[1]]);
				continue;
			}
			//event covers start of pair only
			if (curEvent.scheduledStart < timePair[0] && curEvent.scheduledStart + curEvent.duration < timePair[1]) {
				timePairs.push([curEvent.scheduledStart + curEvent.duration, timePair[1]]);
				continue;
			}
			//event covers end of pair only
			if (curEvent.scheduledStart > timePair[0] && curEvent.scheduledStart + curEvent.duration > timePair[1]) {
				timePairs.push([timePair[0], curEvent.scheduledStart]);
				continue;
			}
			//event completely covers pair
			if (curEvent.scheduledStart < timePair[0] && curEvent.scheduledStart + curEvent.duration > timePair[1]) {
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
	} else if (between(task1.scheduledStart + task1.duration, task2.scheduledStart, task2 + scheduledStart.duration)) {
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


tasks = [it1, it2, it3];
unscheduled = []
unschedulable = [];
schedule = [];

//make all tasks valid, and moves tasks that can't be made valid to unschedulable
unscheduled = tasks;
tasks = [];
while (task = unscheduled.pop())
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
	timePairs = freeTimes(schedule, task.startAfter, task.endBefore);
	while(timePair = timePairs.pop()) {
		if (timePair[1] - timePair[0] > task.duration) {
			task.scheduledStart = timePair[0];
			scheduled.push(task);
			task = undefined;
			break;
		}
	}
	if (task !== undefined) {
		unscheduled.push(task);
	}
}
