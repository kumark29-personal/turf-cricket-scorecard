var scoreboard = [[], [0]]; //scoreboard[<over_no>][0] counts wide runs
var widesData = [[], [0, 0]]; // widesData[over_no] = [count, runs]
var noBallsData = [[], [0, 0]]; // noBallsData[over_no] = [count, runs]
var ballDetails = [[], []]; // ballDetails[over_no] = ["1", "1NB+6", "Wd", etc.]
var ballExtras = [[], []]; // ballExtras[over_no][ball_no] = {wides: 0, noBalls: 0}
var deliveryHistory = []; // Track all deliveries for undo: {type, over, ball, data}
var ball_no = 1; // Ball number will start from 1
var over_no = 1; // Over number will start from 1
var runs = 0;
var edited = [];
var isNoBall = false;
var isTargetMode = false;
var targetRuns = -1; // total runs scored by other team
var targetOvers = -1; //total overs
var isShareMode = false;

// localStorage functions for match data persistence
function saveMatchData() {
	try {
		const matchData = {
			scoreboard: scoreboard,
			widesData: widesData,
			noBallsData: noBallsData,
			ballDetails: ballDetails,
			ballExtras: ballExtras,
			ball_no: ball_no,
			over_no: over_no,
			runs: runs,
			edited: edited,
			isTargetMode: isTargetMode,
			targetRuns: targetRuns,
			targetOvers: targetOvers
		};
		localStorage.setItem('cricketMatchData', JSON.stringify(matchData));
	} catch (e) {
		console.error('Error saving match data:', e);
	}
}

function loadMatchData() {
	try {
		const savedData = localStorage.getItem('cricketMatchData');
		if (savedData) {
			const matchData = JSON.parse(savedData);
			scoreboard = matchData.scoreboard || [[], [0]];
			widesData = matchData.widesData || [[], [0, 0]];
			noBallsData = matchData.noBallsData || [[], [0, 0]];
			ballDetails = matchData.ballDetails || [[], []];
			ballExtras = matchData.ballExtras || [[], []];
			ball_no = matchData.ball_no || 1;
			over_no = matchData.over_no || 1;
			runs = matchData.runs || 0;
			edited = matchData.edited || [];
			isTargetMode = matchData.isTargetMode || false;
			targetRuns = matchData.targetRuns || -1;
			targetOvers = matchData.targetOvers || -1;

			// Update all displays after loading
			update_score();
			update_runboard();
			update_scoreboard();
			update_statistics();
			return true;
		}
		return false;
	} catch (e) {
		console.error('Error loading match data:', e);
		return false;
	}
}

function clearMatchData() {
	try {
		localStorage.removeItem('cricketMatchData');
		// Reload page to reset everything
		location.reload();
	} catch (e) {
		console.error('Error clearing match data:', e);
	}
}

$(document).ready(function () {
	// Load saved match data on page load
	loadMatchData();

	$("#run_dot").on("click", function (event) {
		play_ball("D", 0);
	});
	$("#run_1").on("click", function (event) {
		play_ball(1);
	});
	$("#run_2").on("click", function (event) {
		play_ball(2);
	});
	$("#run_3").on("click", function (event) {
		play_ball(3);
	});
	$("#run_wide").on("click", function (event) {
		play_ball("+", 0);
	});
	$("#run_no_ball").on("click", function (event) {
		play_ball("NB", 0);
	});
	$("#run_4").on("click", function (event) {
		play_ball(4);
	});
	$("#run_6").on("click", function (event) {
		play_ball(6);
	});
	$("#run_W").on("click", function (event) {
		play_ball("W", 0);
	});
	$("#scoreboard-btn").on("click", function (event) {
		update_scoreboard();
	});
	init();
});

function init() {
	const urlParams = new URLSearchParams(window.location.search);
	console.log("urlParams.get()");
	console.log(urlParams.get("debug"));
	if (urlParams.get("debug") == null || urlParams.get("debug") != "true")
		$("#messages").hide();
	// const queryString = window.location.search;
	// const urlParams = new URLSearchParams(queryString);
	// console.log(urlParams.get("matchCode"));
	// console.log(document.location.origin);
}

function shareModeStart() {
	isShareMode = true;
	startConnect();
}

function play_ball(run, score = 1) {
	if (run == "+") {
		//Wide ball
		runs++;
		scoreboard[over_no][0] += 1;
		// Track wide
		if (!widesData[over_no]) widesData[over_no] = [0, 0];
		if (!ballDetails[over_no]) ballDetails[over_no] = [];
		if (!ballExtras[over_no]) ballExtras[over_no] = [];
		if (!ballExtras[over_no][ball_no]) ballExtras[over_no][ball_no] = { wides: 0, noBalls: 0 };
		widesData[over_no][0]++; // count
		widesData[over_no][1]++; // runs (1 run for wide)
		ballExtras[over_no][ball_no].wides++;
		ballDetails[over_no].push("Wd");
		// Record delivery for undo
		deliveryHistory.push({ type: 'wide', over: over_no, ball: ball_no });
		update_runboard();
		update_score();
		return;
	}
	if (run == "NB") {
		// isNoBall = true;
		noBall(true);
		//No ball
		runs++;
		scoreboard[over_no][0] += 1;
		// Track no ball - will be updated when runs are scored
		if (!noBallsData[over_no]) noBallsData[over_no] = [0, 0];
		if (!ballDetails[over_no]) ballDetails[over_no] = [];
		if (!ballExtras[over_no]) ballExtras[over_no] = [];
		if (!ballExtras[over_no][ball_no]) ballExtras[over_no][ball_no] = { wides: 0, noBalls: 0 };
		noBallsData[over_no][0]++; // count
		noBallsData[over_no][1]++; // runs (1 run for no ball)
		ballExtras[over_no][ball_no].noBalls++;
		// Placeholder - will be updated when runs are scored
		ballDetails[over_no].push("1NB+0");
		// Record delivery for undo (will be updated with runs)
		deliveryHistory.push({ type: 'noball', over: over_no, ball: ball_no, runs: 1 });
		update_runboard();
		update_score();
		return;
	}
	if (score == 1) {
		runs += run;
	}
	// console.log("over_no=", over_no, "| ball_no=", ball_no," |Runs=",runs);

	if (isNoBall) {
		scoreboard[over_no][0] += run == "D" ? 0 : run;
		// Update no ball data with additional runs
		if (noBallsData[over_no]) {
			noBallsData[over_no][1] += run == "D" ? 0 : run;
		}
		// Update ball details for no ball
		if (ballDetails[over_no] && ballDetails[over_no].length > 0) {
			let lastIndex = ballDetails[over_no].length - 1;
			ballDetails[over_no][lastIndex] = "1NB+" + (run == "D" ? 0 : run);
		}
		// Update the last delivery with actual runs
		if (deliveryHistory.length > 0 && deliveryHistory[deliveryHistory.length - 1].type === 'noball') {
			deliveryHistory[deliveryHistory.length - 1].runs = 1 + (run == "D" ? 0 : run);
		}
		noBall(false);
	} else {
		scoreboard[over_no][ball_no] = run;
		// Record legal ball delivery for undo
		deliveryHistory.push({ type: 'legal', over: over_no, ball: ball_no, run: run });
		// Track ball details
		if (!ballDetails[over_no]) ballDetails[over_no] = [];
		let ballDisplay = run == "D" ? "0" : run;
		ballDetails[over_no].push(ballDisplay.toString());
		// console.log(scoreboard[over_no]);
		// console.log(scoreboard);
		ball_no++;
		if (ball_no >= 7) {
			ball_no = 1;
			over_no++;
			scoreboard[over_no] = [];
			scoreboard[over_no][0] = 0; //Wide bowls counter
			widesData[over_no] = [0, 0];
			noBallsData[over_no] = [0, 0];
			ballDetails[over_no] = [];
			ballExtras[over_no] = [];
		}
		update_runboard(); // Call AFTER ball_no increment
	}
	update_score();
	update_scoreboard();
}

function update_runboard() {
	// Updates the runboard when the function is called
	for (i = 1; i < 7; i++) {
		let score_und = (_score_und) => (_score_und == undefined ? "" : _score_und);
		updateHtml("#ball_no_" + i.toString(), score_und(scoreboard[over_no][i]));

		// Update extras badge for this ball
		if (ballExtras[over_no] && ballExtras[over_no][i]) {
			let extras = ballExtras[over_no][i];
			let badgeText = "";
			let parts = [];

			if (extras.wides > 0) {
				parts.push(extras.wides + "W");
			}
			if (extras.noBalls > 0) {
				parts.push(extras.noBalls + "N");
			}

			if (parts.length > 0) {
				badgeText = parts.join(",");
				$("#ball_extras_" + i).text(badgeText);
				$("#ball_extras_" + i).show();
			} else {
				$("#ball_extras_" + i).hide();
			}
		} else {
			$("#ball_extras_" + i).hide();
		}
	}
	if (ball_no != 1) {
		$("#ball_no_" + ball_no.toString()).removeClass("btn-light");
		$("#ball_no_" + ball_no.toString()).addClass("btn-primary");
	} else {
		for (i = 2; i <= 6; i++) {
			$("#ball_no_" + i.toString()).removeClass("btn-primary");
			$("#ball_no_" + i.toString()).addClass("btn-light");
		}
	}
	// Display balls bowled, not next ball number
	let ballsBowled = ball_no - 1;
	let currentOver = over_no - 1;

	// When 6 balls are completed, show as next over with .0
	if (ballsBowled === 0 && over_no > 1) {
		// Just completed an over, show as X.0 (e.g., 1.0, 2.0)
		currentOver = over_no - 1;
		ballsBowled = 0;
	}

	updateHtml(
		"#over-ball",
		currentOver.toString() + "." + ballsBowled.toString()
	);

	// Update extras display - count from ballDetails for accuracy
	let extrasText = "";
	let extrasInfo = [];

	// Count wides and no balls from ballDetails for current over
	let widesCount = 0;
	let noBallsCount = 0;

	if (ballDetails[over_no]) {
		ballDetails[over_no].forEach(ball => {
			if (ball === "Wd") {
				widesCount++;
			} else if (ball.includes("NB")) {
				noBallsCount++;
			}
		});
	}

	if (widesCount > 0) {
		extrasInfo.push(widesCount + "Wd");
	}
	if (noBallsCount > 0) {
		extrasInfo.push(noBallsCount + "NB");
	}

	if (extrasInfo.length > 0) {
		extrasText = "(" + extrasInfo.join(", ") + ")";
	}

	updateHtml("#extras-display", extrasText);
}

function change_score() {
	let over = parseInt($("#change_over").val());
	let ball = parseInt($("#change_ball").val());
	let run = parseInt($("#change_run").val());
	edited.push([over, ball, scoreboard[over][ball], run]);
	scoreboard[over][ball] = run;

	// Update ballDetails to reflect the change
	if (ballDetails[over] && ballDetails[over].length >= ball) {
		let ballIndex = ball - 1; // ballDetails is 0-indexed for legal balls
		let legalBallCount = 0;
		let detailIndex = -1;

		// Find the correct index in ballDetails for this legal ball
		for (let i = 0; i < ballDetails[over].length; i++) {
			if (ballDetails[over][i] !== "Wd" && !ballDetails[over][i].includes("NB")) {
				legalBallCount++;
				if (legalBallCount === ball) {
					detailIndex = i;
					break;
				}
			}
		}

		if (detailIndex >= 0) {
			let newValue = run == 0 ? "0" : run.toString();
			ballDetails[over][detailIndex] = newValue;
		}
	}

	update_score();
	update_scoreboard();
	update_statistics(); // Update the statistics section
	updateHtml("#run", runs);
	let edited_scores = "Edited scores:<br>";
	for (i = 0; i < edited.length; i++) {
		edited_scores +=
			"(" +
			edited[i][0].toString() +
			"." +
			edited[i][1].toString() +
			") = " +
			edited[i][2].toString() +
			" -> " +
			edited[i][3].toString();
		edited_scores += "<br>";
	}
	// }
	updateHtml("#edited-scores", edited_scores);
}

function update_scoreboard() {
	// Updates the table in the modal which appears when the scoreboard button is pressed.
	var table = "";
	let totalRuns = 0;
	let totalWickets = 0;

	for (i = 1; i <= over_no; i++) {
		table = table + "<tr>";
		table += "<td>" + i.toString() + "</td>";
		table +=
			"<td>" +
			scoreboard[i].slice(1, 7).join(" - ") +
			" (" +
			scoreboard[i][0].toString() +
			")" +
			"</td>";

		// Calculate total for this over
		let numOr0 = (n) => (n == "+" ? 1 : isNaN(n) ? 0 : n);
		let overTotal = scoreboard[i].reduce((a, b) => numOr0(a) + numOr0(b));
		table += "<td style='font-weight: bold; color: #0d6efd;'>" + overTotal + "</td>";
		table = table + "</tr>";

		// Calculate totals
		totalRuns += overTotal;
		scoreboard[i].forEach((element) => {
			if (element == "W") totalWickets++;
		});
	}

	// Add total row
	table += "<tr style='background-color: #0d6efd; color: white; font-weight: bold;'>";
	table += "<td>Total</td>";
	table += "<td>" + totalRuns + "/" + totalWickets + "</td>";
	table += "<td>" + totalRuns + "</td>";
	table += "</tr>";

	updateHtml(
		"#scoreboard",
		"<tr><th>Over</th><th>Score (Extras)</th><th>Total</th></tr>" + table
	);
}

function update_score() {
	let score = 0;
	let wickets = 0;

	for (i = 1; i <= over_no; i++) {
		let numOr0 = (n) => (n == "+" ? 1 : isNaN(n) ? 0 : n);
		score += scoreboard[i].reduce((a, b) => numOr0(a) + numOr0(b));
		scoreboard[i].forEach((element) => {
			if (element == "W") wickets++;
		});
	}
	// console.log(wickets);
	runs = score;
	updateTarget();
	updateHtml("#run", runs);
	updateHtml("#wickets", wickets);
	update_statistics();
	saveMatchData(); // Auto-save match data
}

function update_statistics() {
	// Calculate total wides and no balls
	let totalWidesCount = 0;
	let totalWidesRuns = 0;
	let totalNoBallsCount = 0;
	let totalNoBallsRuns = 0;

	// Count wides and no balls from tracking arrays
	for (let i = 1; i <= over_no; i++) {
		if (widesData[i]) {
			totalWidesCount += widesData[i][0];
			totalWidesRuns += widesData[i][1];
		}
		if (noBallsData[i]) {
			totalNoBallsCount += noBallsData[i][0];
			totalNoBallsRuns += noBallsData[i][1];
		}
	}

	// Build all overs breakdown - show most recent first
	let allOversBreakdown = "";
	for (let i = over_no; i >= 1; i--) {
		if (!ballDetails[i] || ballDetails[i].length === 0) continue;

		// Calculate total runs for this over
		let overRuns = 0;
		if (scoreboard[i]) {
			let numOr0 = (n) => (n == "+" ? 1 : isNaN(n) ? 0 : n);
			overRuns = scoreboard[i].reduce((a, b) => numOr0(a) + numOr0(b));
		}

		// Create styled balls for this over
		let styledBalls = ballDetails[i].map(ball => {
			let bgColor, textColor, ballText;

			if (ball === "Wd") {
				bgColor = "#ffc107"; // Yellow for wide
				textColor = "#000";
				ballText = "Wd";
			} else if (ball.includes("NB")) {
				bgColor = "#dc3545"; // Red for no ball
				textColor = "#fff";
				// Extract runs from "1NB+6" format
				let runs = ball.split("+")[1];
				ballText = '<div style="line-height: 1rem; font-size: 0.65rem;">NB<br><span style="font-size: 0.9rem; font-weight: bold;">+' + runs + '</span></div>';
			} else if (ball === "0") {
				bgColor = "#6c757d"; // Gray for dot
				textColor = "#fff";
				ballText = "•";
			} else if (ball === "W") {
				bgColor = "#000"; // Black for wicket
				textColor = "#fff";
				ballText = "W";
			} else {
				bgColor = "#0d6efd"; // Blue for runs
				textColor = "#fff";
				ballText = ball;
			}

			return '<span style="display: inline-block; width: 2rem; height: 2rem; line-height: 2rem; text-align: center; border-radius: 50%; background-color: ' + bgColor + '; color: ' + textColor + '; font-size: 0.75rem; font-weight: bold; margin: 2px; vertical-align: middle;">' + ballText + '</span>';
		}).join(' ');

		let overLine = '<div style="margin-bottom: 8px; padding: 8px; background-color: #f8f9fa; border-radius: 5px; display: flex; align-items: center; gap: 8px;">' +
			'<strong style="color: #0d6efd; white-space: nowrap;">Over ' + i + ':</strong> ' +
			'<div style="flex: 1; display: flex; align-items: center; flex-wrap: wrap;">' + styledBalls + '</div>' +
			'<span style="background-color: #0d6efd; color: white; padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; white-space: nowrap;">Tot: ' + overRuns + '</span>' +
			'</div>';

		allOversBreakdown += overLine;
	}

	if (allOversBreakdown === "") {
		allOversBreakdown = "No balls bowled yet";
	}

	updateHtml("#currentOverStats", allOversBreakdown);
	updateHtml("#totalWides", totalWidesCount);
	updateHtml("#widesDetail", totalWidesRuns + " run" + (totalWidesRuns !== 1 ? "s" : ""));
	updateHtml("#totalNoBalls", totalNoBallsCount);
	updateHtml("#noBallsDetail", totalNoBallsRuns + " run" + (totalNoBallsRuns !== 1 ? "s" : ""));
}

function back_button() {
	if (deliveryHistory.length === 0) return;

	// Get the last delivery
	const lastDelivery = deliveryHistory.pop();

	if (lastDelivery.type === 'wide') {
		// Undo wide
		scoreboard[lastDelivery.over][0]--; // Decrease extras
		if (widesData[lastDelivery.over]) {
			widesData[lastDelivery.over][0]--; // Decrease wide count
			widesData[lastDelivery.over][1]--; // Decrease wide runs
		}
		if (ballDetails[lastDelivery.over]) {
			ballDetails[lastDelivery.over].pop(); // Remove from ball details
		}
		if (ballExtras[lastDelivery.over] && ballExtras[lastDelivery.over][lastDelivery.ball]) {
			ballExtras[lastDelivery.over][lastDelivery.ball].wides--;
		}
	} else if (lastDelivery.type === 'noball') {
		// Undo no ball
		scoreboard[lastDelivery.over][0] -= lastDelivery.runs; // Decrease extras
		if (noBallsData[lastDelivery.over]) {
			noBallsData[lastDelivery.over][0]--; // Decrease no ball count
			noBallsData[lastDelivery.over][1] -= lastDelivery.runs; // Decrease no ball runs
		}
		if (ballDetails[lastDelivery.over]) {
			ballDetails[lastDelivery.over].pop(); // Remove from ball details
		}
		if (ballExtras[lastDelivery.over] && ballExtras[lastDelivery.over][lastDelivery.ball]) {
			ballExtras[lastDelivery.over][lastDelivery.ball].noBalls--;
		}
		noBall(false); // Reset no ball state
	} else {
		// Undo legal ball
		ball_no--;
		if (ball_no == 0) {
			ball_no = 6;
			over_no--;
		}
		scoreboard[lastDelivery.over][lastDelivery.ball] = undefined;
		if (ballDetails[lastDelivery.over]) {
			// Find and remove the legal ball from ballDetails
			let legalBallIndex = -1;
			let legalCount = 0;
			for (let i = 0; i < ballDetails[lastDelivery.over].length; i++) {
				if (ballDetails[lastDelivery.over][i] !== "Wd" && !ballDetails[lastDelivery.over][i].includes("NB")) {
					legalCount++;
					if (legalCount === lastDelivery.ball) {
						legalBallIndex = i;
						break;
					}
				}
			}
			if (legalBallIndex >= 0) {
				ballDetails[lastDelivery.over].splice(legalBallIndex, 1);
			}
		}
	}

	update_score();
	update_scoreboard();
	update_runboard();
	update_statistics();
}

function noBall(is_NoBall) {
	isNoBall = is_NoBall;
	var run_no_ball = $("#run_no_ball");
	if (is_NoBall) {
		$("#no-ball-warning").show();
		$("#run_wide").prop("disabled", true);
		$("#run_no_ball").prop("disabled", true);
		$("#run_W").prop("disabled", true);

		run_no_ball.css("backgroundColor", "#0D6EFD");
		run_no_ball.css("color", "#ffffff");
	} else {
		$("#no-ball-warning").hide();
		$("#run_wide").prop("disabled", false);
		$("#run_no_ball").prop("disabled", false);
		$("#run_W").prop("disabled", false);

		run_no_ball.css("backgroundColor", "#e5f3ff");
		run_no_ball.css("color", "#0D6EFD");
	}
}

function setTarget(isTargetModeOn = true) {
	isTargetMode = isTargetModeOn;
	if (!isTargetModeOn) {
		$("#targetBoard").hide();
		$("#targetModeButton").show();
	} else {
		targetRuns = parseInt($("#targetRuns").val());
		targetOvers = parseInt($("#targetOvers").val());
		updateTarget();
		$("#targetBoard").show(2500);
		$("#targetModeButton").hide();
	}
	publishMessage(
		JSON.stringify({
			isTargetMode: isTargetMode,
		})
	);
}

function updateTarget() {
	if (!isTargetMode) return;
	updateHtml("#targetRunsRequired", targetRuns - runs);
	let ballsLeft = targetOvers * 6 - ((over_no - 1) * 6 + ball_no - 1);
	updateHtml("#targetOversLeft", ballsLeft);

	let closeButton =
		'&nbsp;&nbsp;<button type="button" class="btn-close" onClick="setTarget(false)"></button>';
	if (ballsLeft == 0) {
		if (targetRuns < runs) {
			updateHtml(
				"#targetBody",
				"Hurray! The batting team has Won!!" + closeButton
			);
		} else if (targetRuns - 1 == runs) {
			updateHtml("#targetBody", "Match Over! It's a tie." + closeButton);
		} else {
			updateHtml(
				"#targetBody",
				"Hurray! The bowling team has Won!!" + closeButton
			);
		}
		$("#targetModeButton").show();
	}
	if (targetRuns <= runs) {
		updateHtml(
			"#targetBody",
			"Hurray! The batting team has Won!!" + closeButton
		);
		$("#targetModeButton").show();
	}
}

function updateHtml(eleId, newHtml) {
	/// eleId is in the form of "#overs"
	let isSame = $(eleId).html() == newHtml;
	$(eleId).html(newHtml);

	if (isShareMode && !isSame)
		publishMessage(
			JSON.stringify({
				update: { eleId: eleId, newHtml: newHtml },
			})
		);
	// publishMessage(
	// 	JSON.stringify({
	// 		scoreboard: scoreboard,
	// 		ball_no: ball_no,
	// 		over_no: over_no,
	// 		runs: runs,
	// 		edited: edited,
	// 		isNoBall: isNoBall,
	// 		isTargetMode: isTargetMode,
	// 		targetRuns: targetRuns,
	// 		targetOvers: targetOvers,
	// 	})
	// );
}

function sendInitVariables() {
	let vars = {
		"#ball_no_1": $("#ball_no_1").html(),
		"#ball_no_2": $("#ball_no_2").html(),
		"#ball_no_3": $("#ball_no_3").html(),
		"#ball_no_4": $("#ball_no_4").html(),
		"#ball_no_5": $("#ball_no_5").html(),
		"#ball_no_6": $("#ball_no_6").html(),
		"#over-ball": $("#over-ball").html(),
		"#run": $("#run").html(),
		"#edited-scores": $("#edited-scores").html(),
		"#scoreboard": $("#scoreboard").html(),
		"#wickets": $("#wickets").html(),
		"#targetRunsRequired": $("#targetRunsRequired").html(),
		"#targetBody": $("#targetBody").html(),
	};
	publishMessage(
		JSON.stringify({
			init: vars,
			isTargetMode: isTargetMode,
		})
	);
}
