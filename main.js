var scoreboard = [[], [0]]; //scoreboard[<over_no>][0] counts wide runs
var widesData = [[], [0, 0]]; // widesData[over_no] = [count, runs]
var noBallsData = [[], [0, 0]]; // noBallsData[over_no] = [count, runs]
var ballDetails = [[], []]; // ballDetails[over_no] = ["1", "1NB+6", "Wd", etc.]
var ballExtras = [[], []]; // ballExtras[over_no][ball_no] = {wides: 0, noBalls: 0}
var deliveryHistory = []; // Track all deliveries for undo: {type, over, ball, data}
var ball_no = 1; // Ball number will start from 1
var over_no = 1; // Over number will start from 1
var runs = 0;
var wickets = 0;
var extras = 0;
var edited = [];
var isNoBall = false;
var isTargetMode = false;
var targetRuns = -1; // total runs scored by other team
var targetOvers = -1; //total overs
var maxOversMode = false; // Track if max overs mode is active
var maxOvers = -1; // Maximum overs for the innings
var isShareMode = false;
var wicketWithRunMode = false; // Track if wicket with run mode is active
var battingTeamName = ""; // Batting team name
var bowlingTeamName = ""; // Bowling team name
var matchStartTime = null; // Timestamp when match/innings starts
var matchEndTime = null; // Timestamp when match/innings ends

// localStorage functions for match data persistence
function saveMatchData() {
	try {
		const matchData = {
			runs,
			wickets,
			over_no,
			ball_no,
			scoreboard,
			ballDetails,
			extras,
			isTargetMode,
			targetRuns,
			targetOvers,
			maxOversMode,
			maxOvers,
			deliveryHistory,
			battingTeamName,
			bowlingTeamName,
			startTime: matchStartTime,
			endTime: matchEndTime,
			timestamp: Date.now()
		};
		localStorage.setItem('cricketMatchData', JSON.stringify(matchData));
	} catch (e) {
		console.error('Error saving match data:', e);
	}
}

// Load match data from localStorage
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
			maxOversMode = matchData.maxOversMode || false;
			maxOvers = matchData.maxOvers || -1;
			deliveryHistory = matchData.deliveryHistory || [];
			battingTeamName = matchData.battingTeamName || "";
			bowlingTeamName = matchData.bowlingTeamName || "";
			matchStartTime = matchData.startTime || null;
			matchEndTime = matchData.endTime || null;

			// Update all displays after loading
			update_score();
			update_runboard();
			update_scoreboard();
			update_statistics();
			updateMaxOversDisplay();
			updateTeamDisplay();
			return true;
		}

		// Check for second innings target data
		const secondInningsData = localStorage.getItem('secondInningsTarget');
		if (secondInningsData) {
			const targetData = JSON.parse(secondInningsData);
			isTargetMode = targetData.isTargetMode;
			targetRuns = targetData.targetRuns;
			targetOvers = targetData.targetOvers;
			battingTeamName = targetData.battingTeamName || "";
			bowlingTeamName = targetData.bowlingTeamName || "";
			matchStartTime = targetData.startTime || Date.now(); // Load start time or use current time as fallback
			matchEndTime = null; // Second innings hasn't ended yet

			// Show target board
			updateTarget();
			// $("#targetBoard").show(); // Target now shown in top row
			$("#targetModeButton").hide();

			// Hide Max Overs button for second innings
			$("#maxOversHomeBtn").hide();
			updateMaxOversDisplay();
			updateTeamDisplay();

			// Clear the second innings target data (one-time use)
			localStorage.removeItem('secondInningsTarget');

			// Save to current match data so it persists
			saveMatchData();

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
		// Determine if current match is 2nd innings
		// Check if we're in target mode AND the last saved match was a 1st innings
		let inningsType = 'single';

		if (isTargetMode) {
			const history = JSON.parse(localStorage.getItem('cricketMatchHistory') || '[]');
			if (history.length > 0) {
				const lastMatch = history[history.length - 1];
				// If last match was 1st innings, current match is 2nd innings
				if (lastMatch.inningsType === '1st') {
					inningsType = '2nd';
				}
			}
		}

		// Save current match to history before clearing
		saveMatchToHistory(inningsType);

		// Clear current match data
		localStorage.removeItem('cricketMatchData');

		// Reset target mode and max overs mode flags
		isTargetMode = false;
		targetRuns = -1;
		targetOvers = -1;
		maxOversMode = false;
		maxOvers = -1;

		// Reload page to reset everything
		location.reload();
	} catch (e) {
		console.error('Error clearing match data:', e);
	}
}

// Start fresh match - saves current match and starts new one
function startFreshMatch() {
	// Determine innings type based on context
	let inningsType = 'single';

	// If max overs mode is active and we've completed max overs, save as 1st innings
	if (maxOversMode && over_no > maxOvers) {
		inningsType = '1st';
	}
	// If in target mode (second innings), save as 2nd innings
	else if (isTargetMode) {
		inningsType = '2nd';
	}

	// Save current match to history with appropriate innings type
	saveMatchToHistory(inningsType);

	// Clear current match data
	localStorage.removeItem('cricketMatchData');

	// Clear second innings target data if it exists
	localStorage.removeItem('secondInningsTarget');

	// Reset timing variables
	matchStartTime = null;
	matchEndTime = null;

	// Reload to show empty scorecard
	location.reload();
}

// Save and exit - saves match without starting new one
function saveAndExit() {
	// Determine innings type based on context
	let inningsType = 'single';

	// If max overs mode is active and we've completed max overs, save as 1st innings
	if (maxOversMode && over_no > maxOvers) {
		inningsType = '1st';
	}
	// If in target mode (second innings), save as 2nd innings
	else if (isTargetMode) {
		inningsType = '2nd';
	}

	// Save current match to history with appropriate innings type
	saveMatchToHistory(inningsType);

	// Clear current match data
	localStorage.removeItem('cricketMatchData');

	// Clear second innings target data if it exists
	localStorage.removeItem('secondInningsTarget');

	// Reset timing variables
	matchStartTime = null;
	matchEndTime = null;

	// Show success message
	alert('✅ Match saved successfully! You can now close the app or start a new match.');

	// Reload to show empty scorecard
	location.reload();
}

// Match History Functions
function saveMatchToHistory(inningsType = 'single') {
	// Only save if there's actual match data
	if (runs === 0 && ball_no === 1 && over_no === 1) {
		return; // Nothing to save
	}

	try {
		// Get existing history
		const history = JSON.parse(localStorage.getItem('cricketMatchHistory') || '[]');

		// Get match counter - this counter ALWAYS increments, never reuses numbers
		let matchCounter = parseInt(localStorage.getItem('cricketMatchCounter') || '0');

		// Increment counter for new matches (not for second innings)
		// Counter increments even if matches are deleted to avoid reusing match numbers
		if (inningsType !== '2nd') {
			matchCounter++;
			localStorage.setItem('cricketMatchCounter', matchCounter.toString());
		}

		// Set end time if not already set
		if (!matchEndTime) {
			matchEndTime = Date.now();
		}

		// Calculate duration in minutes
		let duration = null;
		if (matchStartTime && matchEndTime) {
			duration = Math.round((matchEndTime - matchStartTime) / 60000); // Convert ms to minutes
		}

		// Determine match name based on innings type
		let matchName;
		if (inningsType === '2nd') {
			// For 2nd innings, get match name from last entry in history
			if (history.length > 0) {
				matchName = history[history.length - 1].matchName;
			} else {
				// Fallback if no history
				matchName = `Match ${matchCounter}`;
			}
		} else {
			matchName = `Match ${matchCounter}`;
		}

		const matchData = {
			matchId: `match_${Date.now()}_${Math.random()}`,
			matchName: matchName,
			inningsType: inningsType,
			inningsLabel: inningsType === '1st' ? '1st Innings' : (inningsType === '2nd' ? '2nd Innings' : null),
			runs,
			wickets,
			scoreboard,
			ballDetails,
			extras,
			finalScore: `${runs}/${wickets}`,
			totalOvers: `${over_no - 1}.${ball_no - 1}`,
			timestamp: Date.now(),
			battingTeamName,
			bowlingTeamName,
			startTime: matchStartTime,
			endTime: matchEndTime,
			duration: duration // Duration in minutes
		};

		// Add to history
		history.push(matchData);

		// Limit to 50 matches to prevent localStorage overflow
		if (history.length > 50) {
			history.shift();
		}

		// Save to localStorage
		localStorage.setItem('cricketMatchHistory', JSON.stringify(history));

		console.log('Match saved to history:', matchData.matchName, matchData.inningsLabel || '');
	} catch (e) {
		console.error('Error saving match to history:', e);
	}
}

function getMatchHistory() {
	try {
		const history = JSON.parse(localStorage.getItem('cricketMatchHistory') || '[]');
		// Return newest first (create new array to avoid modifying original)
		return [...history].reverse();
	} catch (e) {
		console.error('Error loading match history:', e);
		return [];
	}
}

function getMatchById(matchId) {
	try {
		const history = JSON.parse(localStorage.getItem('cricketMatchHistory') || '[]');
		return history.find(match => match.matchId === matchId);
	} catch (e) {
		console.error('Error loading match:', e);
		return null;
	}
}

function showMatchHistory() {
	const history = getMatchHistory();
	const modalBody = document.getElementById('historyModalBody');

	if (history.length === 0) {
		modalBody.innerHTML = `
			<div class="alert alert-info text-center">
				<p>No past matches found.</p>
				<p class="mb-0">Complete a match and click "Start Fresh Match" to save it here.</p>
			</div>
		`;
	} else {
		// Group matches by matchName
		const groupedMatches = {};
		history.forEach((match) => {
			if (!groupedMatches[match.matchName]) {
				groupedMatches[match.matchName] = {};
			}
			if (match.inningsType === '1st') {
				groupedMatches[match.matchName].first = match;
			} else if (match.inningsType === '2nd') {
				groupedMatches[match.matchName].second = match;
			} else {
				// Single innings match
				groupedMatches[match.matchName].single = match;
			}
		});

		let html = '';

		// Display grouped matches (limit to last 2 for modal)
		const matchNames = Object.keys(groupedMatches);

		// Sort matches by timestamp (newest first)
		matchNames.sort((a, b) => {
			const matchA = groupedMatches[a].single || groupedMatches[a].second || groupedMatches[a].first;
			const matchB = groupedMatches[b].single || groupedMatches[b].second || groupedMatches[b].first;
			return new Date(matchB.timestamp) - new Date(matchA.timestamp);
		});

		const displayMatches = matchNames.slice(0, 2); // Show only last 2 matches
		displayMatches.forEach((matchName) => {
			const matchGroup = groupedMatches[matchName];
			const leadingMatchId = (matchGroup.single || matchGroup.first || matchGroup.second).matchId;

			// Get team names from the match (prefer second innings, fallback to first, then single)
			const matchData = matchGroup.second || matchGroup.first || matchGroup.single;
			const battingTeam = matchData.battingTeamName || "";
			const bowlingTeam = matchData.bowlingTeamName || "";

			// Create team names display
			let teamNamesDisplay = "";
			if (battingTeam && bowlingTeam) {
				teamNamesDisplay = `<div style="font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-top: 4px;">${battingTeam} vs ${bowlingTeam}</div>`;
			} else if (battingTeam || bowlingTeam) {
				teamNamesDisplay = `<div style="font-size: 0.85rem; color: rgba(255,255,255,0.9); margin-top: 4px;">${battingTeam || bowlingTeam}</div>`;
			}

			html += `<div class="card match-history-card">`;
			html += `<div class="card-header match-history-header d-flex justify-content-between align-items-center">`;
			html += `<div><h5 class="mb-0"><strong>${matchName}</strong></h5>${teamNamesDisplay}</div>`;
			html += `<button class="btn btn-sm btn-light btn-modern" style="font-size: 0.75rem;" onclick="downloadMatchPDF('${leadingMatchId}')">📥 PDF Report</button>`;
			html += `</div>`;
			html += `<div class="card-body p-4">`;

			if (matchGroup.single) {
				// Single innings match
				const match = matchGroup.single;
				const date = new Date(match.timestamp);
				const formattedDate = date.toLocaleDateString('en-IN', {
					day: '2-digit',
					month: 'short',
					year: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});

				html += `<div class="text-center">`;
				html += `<div class="score-display text-primary">${match.finalScore}</div>`;
				html += `<div class="meta-info mb-3">in ${match.totalOvers} overs • ${formattedDate}</div>`;
				html += `<button class="btn btn-modern btn-modern-outline w-100" onclick="showMatchDetails('${match.matchId}')">`;
				html += `Details</button>`;
				html += `</div>`;
			} else {
				// Two innings match
				html += `<div class="row g-3">`;

				// 1st Innings
				if (matchGroup.first) {
					const match = matchGroup.first;
					const teamName = match.battingTeamName ? ` (${match.battingTeamName})` : "";
					html += `<div class="col-12 col-md-6">`;
					html += `<div class="innings-box innings-box-1 text-center">`;
					html += `<div class="meta-info text-primary">1ST INNINGS${teamName}</div>`;
					html += `<div class="score-display text-primary">${match.finalScore}</div>`;
					html += `<div class="meta-info mb-3">${match.totalOvers} overs</div>`;
					html += `<button class="btn btn-sm btn-modern btn-modern-outline w-100" onclick="showMatchDetails('${match.matchId}')">`;
					html += `Details</button>`;
					html += `</div></div>`;
				}

				// 2nd Innings
				if (matchGroup.second) {
					const match = matchGroup.second;
					const firstInnings = matchGroup.first;
					const teamName = match.battingTeamName ? ` (${match.battingTeamName})` : "";

					// Determine result
					let resultBadge = '';
					if (firstInnings) {
						const firstRuns = firstInnings.runs;
						const secondRuns = match.runs;
						if (secondRuns > firstRuns) {
							resultBadge = '<span class="badge bg-success ms-1">Winner</span>';
						} else if (secondRuns === firstRuns) {
							resultBadge = '<span class="badge bg-warning ms-1">Tie</span>';
						} else {
							resultBadge = '<span class="badge bg-danger ms-1">Runner Up</span>';
						}
					}

					html += `<div class="col-12 col-md-6">`;
					html += `<div class="innings-box innings-box-2 text-center">`;
					html += `<div class="meta-info text-success">2ND INNINGS${teamName} ${resultBadge}</div>`;
					html += `<div class="score-display text-success">${match.finalScore}</div>`;
					html += `<div class="meta-info mb-3">${match.totalOvers} overs</div>`;
					html += `<button class="btn btn-sm btn-modern btn-modern-outline w-100" style="border-color: #28a745; color: #28a745;" onclick="showMatchDetails('${match.matchId}')">`;
					html += `Details</button>`;
					html += `</div></div>`;
				}

				html += `</div>`; // End row

				// Show timestamp for the match
				if (matchGroup.first || matchGroup.second) {
					const match = matchGroup.second || matchGroup.first;
					const date = new Date(match.timestamp);
					const formattedDate = date.toLocaleDateString('en-IN', {
						day: '2-digit',
						month: 'short',
						year: 'numeric',
						hour: '2-digit',
						minute: '2-digit'
					});
					html += `<div class="text-center mt-3">`;
					html += `<div class="meta-info">Played on ${formattedDate}</div>`;
					html += `</div>`;
				}
			}

			html += `</div>`; // End card-body
			html += `</div>`; // End card
		});

		// Add "View All Matches" button if there are more than 2 matches
		if (matchNames.length > 2) {
			html += `<div class="text-center mt-4">`;
			html += `<a href="match_history.html" target="_blank" class="btn btn-modern btn-modern-primary btn-lg px-5">`;
			html += `📋 View Complete History</a>`;
			html += `</div>`;
		}

		modalBody.innerHTML = html;
	}

	// Show the modal
	$('#historyModal').modal('show');
}

function deleteMatch(matchId) {
	// Show confirmation dialog
	if (!confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
		return; // User cancelled
	}

	try {
		const history = getMatchHistory();

		// Find and remove the match
		const updatedHistory = history.filter(match => match.matchId !== matchId);

		// Save updated history
		localStorage.setItem('cricketMatchHistory', JSON.stringify(updatedHistory));

		// Refresh the match history display
		showMatchHistory();

		console.log('Match deleted:', matchId);
	} catch (e) {
		console.error('Error deleting match:', e);
		alert('Failed to delete match. Please try again.');
	}
}

function showMatchDetails(matchId) {
	const match = getMatchById(matchId);

	if (!match) {
		alert('Match not found');
		return;
	}

	// Hide history modal and show details modal
	const historyModal = bootstrap.Modal.getInstance(document.getElementById('historyModal'));
	if (historyModal) {
		historyModal.hide();
	}

	// Set title
	document.getElementById('matchDetailsTitle').textContent = match.matchName;

	// Build details HTML
	let html = `
		<div class="mb-3">
			<h5>Match Summary</h5>
			<div class="row">
				<div class="col-6">
					<p><strong>Final Score:</strong> ${match.finalScore}</p>
					<p><strong>Total Overs:</strong> ${match.totalOvers}</p>
				</div>
				<div class="col-6">
					<p><strong>Total Balls:</strong> ${match.totalBalls}</p>
					<p><strong>Date:</strong> ${new Date(match.timestamp).toLocaleString('en-IN')}</p>
				</div>
			</div>
		</div>
		
		<hr>
		
		<h5>Scoreboard</h5>
		<table class="table table-striped table-success">
			<tr><th>Over</th><th>Score (Extras)</th><th>Total</th></tr>
	`;

	// Build scoreboard
	let cumulativeRuns = 0;
	for (let i = 1; i < match.scoreboard.length; i++) {
		if (!match.scoreboard[i]) continue;

		html += '<tr>';
		html += `<td>${i}</td>`;
		html += `<td>${match.scoreboard[i].slice(1, 7).join(' - ')} (${match.scoreboard[i][0]})</td>`;

		// Calculate over total
		let numOr0 = (n) => (n == '+' ? 1 : isNaN(n) ? 0 : n);
		let overTotal = match.scoreboard[i].reduce((a, b) => numOr0(a) + numOr0(b));
		cumulativeRuns += overTotal;

		html += `<td style='font-weight: bold; color: #0d6efd;'>${cumulativeRuns}</td>`;
		html += '</tr>';
	}

	html += '</table>';

	// Add over breakdown if available
	if (match.ballDetails) {
		html += '<hr><h5>Over Breakdown</h5>';
		html += '<div style="max-height: 300px; overflow-y: auto;">';

		for (let i = match.ballDetails.length - 1; i >= 1; i--) {
			if (!match.ballDetails[i] || match.ballDetails[i].length === 0) continue;

			let styledBalls = match.ballDetails[i].map(ball => {
				let bgColor, textColor, ballText;

				if (ball === 'Wd') {
					bgColor = '#ffc107';
					textColor = '#000';
					ballText = 'Wd';
				} else if (ball.includes('NB')) {
					bgColor = '#dc3545';
					textColor = '#fff';
					let runs = ball.split('+')[1];
					ballText = `<div style="line-height: 1rem; font-size: 0.65rem;">NB<br><span style="font-size: 0.9rem; font-weight: bold;">+${runs}</span></div>`;
				} else if (ball === '0') {
					bgColor = '#6c757d';
					textColor = '#fff';
					ballText = '•';
				} else if (ball === 'W') {
					bgColor = '#000';
					textColor = '#fff';
					ballText = 'W';
				} else {
					bgColor = '#0d6efd';
					textColor = '#fff';
					ballText = ball;
				}

				return `<span style="display: inline-block; width: 2rem; height: 2rem; line-height: 2rem; text-align: center; border-radius: 50%; background-color: ${bgColor}; color: ${textColor}; font-size: 0.75rem; font-weight: bold; margin: 2px;">${ballText}</span>`;
			}).join(' ');

			html += `
				<div style="margin-bottom: 8px; padding: 8px; background-color: #f8f9fa; border-radius: 5px;">
					<strong style="color: #0d6efd;">Over ${i}:</strong> ${styledBalls}
				</div>
			`;
		}

		html += '</div>';
	}

	document.getElementById('matchDetailsBody').innerHTML = html;

	// Show details modal
	setTimeout(() => {
		const detailsModal = new bootstrap.Modal(document.getElementById('matchDetailsModal'));
		detailsModal.show();
	}, 300);
}

function backToMatchHistory() {
	// Hide details modal
	const detailsModal = bootstrap.Modal.getInstance(document.getElementById('matchDetailsModal'));
	if (detailsModal) {
		detailsModal.hide();
	}

	// Show history modal after a short delay
	setTimeout(() => {
		const historyModal = new bootstrap.Modal(document.getElementById('historyModal'));
		historyModal.show();
	}, 300);
}

function downloadMatchPDF(matchId) {
	try {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF();
		const history = JSON.parse(localStorage.getItem('cricketMatchHistory') || '[]');
		const match = history.find(m => m.matchId === matchId);

		if (!match) {
			alert('Match data not found!');
			return;
		}

		// Check for linked matches (both innings)
		let matchesToPrint = [match];
		if (match.inningsType === '1st' || match.inningsType === '2nd') {
			const otherMatch = history.find(m =>
				(m.matchName === match.matchName) &&
				(m.matchId !== match.matchId) &&
				(m.inningsType === (match.inningsType === '1st' ? '2nd' : '1st'))
			);
			if (otherMatch) {
				matchesToPrint = match.inningsType === '1st' ? [match, otherMatch] : [otherMatch, match];
			}
		}

		let yPos = 20;

		// Header
		doc.setFontSize(22);
		doc.setTextColor(13, 110, 253); // #0d6efd
		doc.text(match.matchName, 105, yPos, { align: 'center' });

		// Add team names if available
		if (match.battingTeamName || match.bowlingTeamName) {
			doc.setFontSize(12);
			doc.setTextColor(100);
			yPos += 8;
			const teamText = match.battingTeamName && match.bowlingTeamName
				? `${match.battingTeamName} vs ${match.bowlingTeamName}`
				: (match.battingTeamName || match.bowlingTeamName);
			doc.text(teamText, 105, yPos, { align: 'center' });
		}

		doc.setFontSize(10);
		doc.setTextColor(100);
		yPos += 10;
		doc.text(`Played on: ${new Date(match.timestamp).toLocaleString('en-IN')}`, 105, yPos, { align: 'center' });

		matchesToPrint.forEach((m, index) => {
			if (index > 0) {
				yPos = doc.lastAutoTable.finalY + 15;
				if (yPos > 250) {
					doc.addPage();
					yPos = 20;
				}
			} else {
				yPos += 10;
			}

			doc.setFontSize(16);
			doc.setTextColor(0);
			const teamName = m.battingTeamName ? ` (${m.battingTeamName})` : "";
			const inningsTitle = m.inningsLabel ? `${m.inningsLabel}${teamName}: ${m.finalScore}` : `Score: ${m.finalScore}`;
			doc.text(inningsTitle, 14, yPos);

			yPos += 7;
			doc.setFontSize(10);
			doc.text(`Overs: ${m.totalOvers} | Runs: ${m.runs} | Wickets: ${m.wickets}`, 14, yPos);

			// Add timing information if available
			if (m.startTime && m.endTime) {
				yPos += 5;
				const startDate = new Date(m.startTime);
				const endDate = new Date(m.endTime);
				const startTime = startDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
				const endTime = endDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
				const duration = m.duration || Math.round((m.endTime - m.startTime) / 60000);
				const hours = Math.floor(duration / 60);
				const mins = duration % 60;
				const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
				doc.setTextColor(100);
				doc.text(`Time: ${startTime} - ${endTime} (Duration: ${durationText})`, 14, yPos);
				doc.setTextColor(0);
			}

			// Scoreboard Table
			const tableData = [];
			let cumulativeRuns = 0;
			for (let i = 1; i < m.scoreboard.length; i++) {
				if (!m.scoreboard[i]) continue;

				let numOr0 = (n) => (n == '+' ? 1 : isNaN(n) ? 0 : n);
				let overTotal = m.scoreboard[i].reduce((a, b) => numOr0(a) + numOr0(b));
				cumulativeRuns += overTotal;

				tableData.push([
					i,
					`${m.scoreboard[i].slice(1, 7).join(' - ')} (${m.scoreboard[i][0]})`,
					cumulativeRuns
				]);
			}

			doc.autoTable({
				startY: yPos + 5,
				head: [['Over', 'Score (Extras)', 'Total']],
				body: tableData,
				theme: 'striped',
				headStyles: { fillColor: m.inningsType === '2nd' ? [40, 167, 69] : [13, 110, 253] }, // Green for 2nd, Blue otherwise
			});

			yPos = doc.lastAutoTable.finalY;
		});

		doc.save(`${match.matchName.replace(/\s+/g, '_')}_Scorecard.pdf`);
	} catch (e) {
		console.error('Error generating PDF:', e);
		alert('Error generating PDF. Please ensure all libraries are loaded.');
	}
}

$(document).ready(function () {
	// Load saved match data on page load
	loadMatchData();


	// Initialize max overs display
	updateMaxOversDisplay();

	// Hide page loader after everything is loaded
	setTimeout(function () {
		$("#pageLoader").fadeOut(300);
	}, 500);

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
		// Show wicket options modal
		$('#wicketOptionsModal').modal('show');
	});

	// Wicket option handlers
	window.handleWicketNoRun = function () {
		play_ball("W", 0);
	};

	window.handleWicketWithRun = function () {
		wicketWithRunMode = true;
		// Record wicket first
		wickets++;

		// Show instruction message
		$("#no-ball-warning").text("Wicket + Run: Tap the runs scored on this ball.").show();

		// Save wicket to delivery history
		deliveryHistory.push({
			type: 'wicket_with_run_pending',
			over: over_no,
			ball: ball_no,
			runs: runs,
			wickets: wickets
		});

		saveMatchData();
	};

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
	// Handle wicket with run mode
	if (wicketWithRunMode && run !== "W" && run !== "+" && run !== "NB") {
		// User clicked a run button after selecting wicket + run
		runs += run === "D" ? 0 : run;
		scoreboard[over_no][ball_no] = run;

		// Hide instruction message
		$("#no-ball-warning").hide();

		// Update the last delivery with the run information
		if (deliveryHistory.length > 0 && deliveryHistory[deliveryHistory.length - 1].type === 'wicket_with_run_pending') {
			deliveryHistory[deliveryHistory.length - 1] = {
				type: 'wicket_with_run',
				over: over_no,
				ball: ball_no,
				run: run,
				runs: runs,
				wickets: wickets
			};
		}

		// Track ball details
		if (!ballDetails[over_no]) ballDetails[over_no] = [];
		let ballDisplay = run === "D" ? "0" : run;
		ballDetails[over_no].push(ballDisplay.toString() + "W");

		// Move to next ball
		ball_no++;
		if (ball_no >= 7) {
			ball_no = 1;
			over_no++;
			scoreboard[over_no] = [];
			scoreboard[over_no][0] = 0;
			widesData[over_no] = [0, 0];
			noBallsData[over_no] = [0, 0];
			ballDetails[over_no] = [];
			ballExtras[over_no] = [];
		}

		// Reset mode
		wicketWithRunMode = false;

		update_runboard();
		update_score();
		update_scoreboard();
		checkMaxOversComplete();
		saveMatchData();
		return;
	}

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

	// Check if max overs are complete
	checkMaxOversComplete();
}

function update_runboard() {
	// Updates the runboard when the function is called
	for (i = 1; i < 7; i++) {
		let score_und = (_score_und) => (_score_und == undefined ? "" : _score_und);
		let displayValue = score_und(scoreboard[over_no][i]);
		let isWicketWithRun = false;
		let wicketRuns = "";

		// Check if this ball is a wicket+run from ballDetails
		if (ballDetails[over_no] && ballDetails[over_no].length >= i) {
			let ballDetail = ballDetails[over_no][i - 1]; // ballDetails is 0-indexed
			if (ballDetail && ballDetail.toString().endsWith("W") && ballDetail !== "W" && ballDetail !== "Wd") {
				// This is a wicket+run ball, display W in circle and runs as badge
				isWicketWithRun = true;
				wicketRuns = ballDetail.slice(0, -1);
				displayValue = "W";
			}
		}

		updateHtml("#ball_no_" + i.toString(), displayValue);

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
		} else if (isWicketWithRun) {
			// Show runs as badge for wicket+run
			$("#ball_extras_" + i).text("+" + wicketRuns);
			$("#ball_extras_" + i).show();
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

		// Use ballDetails for accurate ball representation
		let ballsDisplay = "";
		if (ballDetails[i] && ballDetails[i].length > 0) {
			ballsDisplay = ballDetails[i].map(ball => {
				if (ball === "Wd") return "Wd";
				if (ball.includes("NB")) return ball;
				if (ball === "0") return "•";
				if (ball === "W") return "W";
				if (ball.toString().endsWith("W")) return ball; // Wicket+run (e.g., "2W")
				return ball;
			}).join(" - ");
		} else {
			// Fallback to scoreboard array
			ballsDisplay = scoreboard[i].slice(1, 7).join(" - ");
		}

		table +=
			"<td>" +
			ballsDisplay +
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
		// Also count wickets from ballDetails (for wicket+run)
		if (ballDetails[i]) {
			ballDetails[i].forEach((ball) => {
				if (ball && ball.toString().endsWith("W") && ball !== "Wd" && ball.length > 1) {
					totalWickets++;
				}
			});
		}
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
	// Capture start time if not already set (for matches without max overs)
	if (!matchStartTime) {
		matchStartTime = Date.now();
	}

	let score = 0;
	let wickets = 0;

	for (i = 1; i <= over_no; i++) {
		let numOr0 = (n) => (n == "+" ? 1 : isNaN(n) ? 0 : n);
		score += scoreboard[i].reduce((a, b) => numOr0(a) + numOr0(b));
		scoreboard[i].forEach((element) => {
			if (element == "W") wickets++;
		});
	}

	// Also count wickets from ball details (for wicket+run cases like "2W")
	for (i = 1; i <= over_no; i++) {
		if (ballDetails[i]) {
			ballDetails[i].forEach((ball) => {
				if (ball && ball.toString().includes("W") && ball !== "Wd") {
					// Check if not already counted (only count if it's XW format, not plain W)
					if (ball.length > 1 && ball !== "Wd") {
						wickets++;
					}
				}
			});
		}
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
			} else if (ball.toString().endsWith("W")) {
				// Wicket + Run (e.g., "2W")
				bgColor = "#000"; // Black for wicket
				textColor = "#fff";
				let runs = ball.slice(0, -1); // Remove 'W' to get runs
				ballText = '<div style="line-height: 1rem; font-size: 0.65rem;">' + runs + '<br><span style="font-size: 0.9rem; font-weight: bold;">W</span></div>';
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

// Target Modal Control Functions
function showTargetInputForCurrent() {
	// Hide options view, show input view
	$("#targetOptionsView").hide();
	$("#targetInputView").show();
	$("#setTargetBtn").show();
	$("#targetModalTitle").text("Set Target for Current Match");
}

function showTargetInputForSecondInnings() {
	// Calculate current match score to pre-fill target
	const currentRuns = runs;
	const currentBalls = (over_no - 1) * 6 + (ball_no - 1);
	const currentOvers = Math.ceil(currentBalls / 6); // Round up to next over

	// Pre-fill target runs (current score + 1) and overs
	$("#targetRuns").val(currentRuns + 1);
	$("#targetOvers").val(currentOvers);

	// Hide options view, show input view
	$("#targetOptionsView").hide();
	$("#targetInputView").show();
	$("#startInningsBtn").show();
	$("#targetModalTitle").text("Start Second Innings");
}

// Max Overs Functions
function showMaxOversInput() {
	// Hide options view, show max overs input view
	$("#targetOptionsView").hide();
	$("#maxOversInputView").show();
	$("#targetInputView").hide();
	$("#setMaxOversBtn").show();
	$("#targetModalTitle").text("Set Maximum Overs");

	// Pre-fill with current value if already set
	if (maxOversMode && maxOvers > 0) {
		$("#maxOversInput").val(maxOvers);
	} else {
		$("#maxOversInput").val("");
	}
}

function setMaxOvers() {
	// Get max overs from input
	const overs = parseInt($("#maxOversInput").val());

	// Validate input
	if (isNaN(overs) || overs <= 0) {
		alert('Please enter a valid number of overs');
		return;
	}

	// Capture team names (optional) - only update if new values provided
	const newBattingTeam = $("#battingTeamInput").val().trim();
	const newBowlingTeam = $("#bowlingTeamInput").val().trim();

	// Only update if user entered something, otherwise keep existing values
	if (newBattingTeam) {
		battingTeamName = newBattingTeam;
	}
	if (newBowlingTeam) {
		bowlingTeamName = newBowlingTeam;
	}

	// Set max overs mode
	maxOversMode = true;
	maxOvers = overs;

	// Capture start time if not already set (first time setting max overs)
	if (!matchStartTime) {
		matchStartTime = Date.now();
	}

	// Save to match data
	saveMatchData();

	// Update displays
	updateMaxOversDisplay();
	updateTeamDisplay();

	console.log('Max overs set to:', maxOvers);
	console.log('Team names:', battingTeamName, 'vs', bowlingTeamName);
}

function updateMaxOversDisplay() {
	if (maxOversMode && maxOvers > 0) {
		// Show the max overs value at the top next to current over
		$("#maxOversTopValue").text(maxOvers);
		$("#maxOversTopDisplay").show();
		$("#maxOversSetButton").hide();
	} else if (!isTargetMode) {
		// Show set button above dot ball only for first innings when not set
		$("#maxOversTopDisplay").hide();
		$("#maxOversSetButton").show();
	} else {
		// Hide both for second innings
		$("#maxOversTopDisplay").hide();
		$("#maxOversSetButton").hide();
	}
}

// Update team name display
function updateTeamDisplay() {
	// Always show the team name display
	if (battingTeamName) {
		// Show first 2 characters
		const shortName = battingTeamName.substring(0, 2).toUpperCase();
		$("#teamNameShort").text(shortName);
	} else {
		// Show placeholder when no team name
		$("#teamNameShort").text("--");
	}
	// Always visible so users can click to add/edit
	$("#teamNameDisplay").show();
}

// Show team edit modal
function showTeamEditModal() {
	// Pre-fill current names
	$("#editBattingTeamInput").val(battingTeamName);
	$("#editBowlingTeamInput").val(bowlingTeamName);

	// Show modal
	const modal = new bootstrap.Modal(document.getElementById('teamEditModal'));
	modal.show();
}

// Save edited team names
function saveTeamNames() {
	battingTeamName = $("#editBattingTeamInput").val().trim();
	bowlingTeamName = $("#editBowlingTeamInput").val().trim();

	// Update display
	updateTeamDisplay();

	// Save to localStorage
	saveMatchData();

	// Close modal
	bootstrap.Modal.getInstance(document.getElementById('teamEditModal')).hide();
}

// Show max overs edit modal
function showMaxOversEditModal() {
	// Pre-fill current max overs
	$("#maxOversInput").val(maxOvers);
	$("#battingTeamInput").val(battingTeamName);
	$("#bowlingTeamInput").val(bowlingTeamName);

	// Show the target modal in max overs mode
	$("#targetOptionsView").hide();
	$("#maxOversInputView").show();
	$("#setMaxOversBtn").show();
	$("#targetModalTitle").text("Edit Max Overs & Teams");

	// Show modal
	const modal = new bootstrap.Modal(document.getElementById('TargetModal'));
	modal.show();
}

function checkMaxOversComplete() {
	if (!maxOversMode) return;

	// Check if we've completed the max overs
	// over_no starts at 1, so when over_no > maxOvers, we've completed maxOvers
	if (over_no > maxOvers) {
		// Calculate current match score for second innings
		const currentRuns = runs;
		const currentOvers = maxOvers;

		let closeButton = '&nbsp;&nbsp;<button type="button" class="btn-close" onClick="setTarget(false)"></button>';
		let startSecondInningsButton = `&nbsp;&nbsp;<button type="button" class="btn btn-sm btn-success" onclick="prepareSecondInnings(${currentRuns + 1}, ${currentOvers})" style="margin-left: 10px;">🏏 Start Second Innings</button>`;

		$("#targetBody").html(`
			<div style="text-align: center; padding: 20px;">
				<h4 style="color: #0d6efd; margin-bottom: 15px;">✅ Over Completed!</h4>
				<p style="margin-bottom: 20px;">First innings complete. Ready to start second innings?</p>
				<div class="d-flex gap-3 justify-content-center">
					<button class="btn btn-success btn-lg" onclick="saveAndExit()" style="min-width: 180px;">💾 Save & Exit</button>
					<button class="btn btn-primary btn-lg" onclick="prepareSecondInnings(${currentRuns + 1}, ${currentOvers})" style="min-width: 180px;">
						🏏 Start 2nd Innings
					</button>
				</div>
			</div>
		`);

		// Show the target board with the message
		$("#targetBoard").css("display", "block"); // Override !important to show message
		$("#targetModeButton").show();

		// Disable max overs mode to prevent repeated messages
		maxOversMode = false;
	}
}

function prepareSecondInnings(targetRuns, targetOvers) {
	// Save 1st innings to history
	saveMatchToHistory('1st');

	// Swap team names for second innings (batting becomes bowling and vice versa)
	const temp = battingTeamName;
	battingTeamName = bowlingTeamName;
	bowlingTeamName = temp;

	// Save target data to localStorage for restoration after reload
	const secondInningsData = {
		isTargetMode: true,
		targetRuns: targetRuns,
		targetOvers: targetOvers,
		isSecondInnings: true,
		battingTeamName: battingTeamName,
		bowlingTeamName: bowlingTeamName
	};
	localStorage.setItem('secondInningsTarget', JSON.stringify(secondInningsData));

	// Clear current match data
	localStorage.removeItem('cricketMatchData');

	// Reload page to start fresh 2nd innings
	location.reload();
}

function resetTargetModal() {
	// Reset modal to initial state
	$("#targetOptionsView").show();
	$("#maxOversInputView").hide();
	$("#targetInputView").hide();
	$("#setMaxOversBtn").hide();
	$("#setTargetBtn").hide();
	$("#startInningsBtn").hide();
	$("#targetModalTitle").text("Target Mode");
	$("#maxOversInput").val("");
	$("#targetRuns").val("");
	$("#targetOvers").val("");
}

// Reset modal when it's closed
$(document).ready(function () {
	$('#TargetModal').on('hidden.bs.modal', function () {
		resetTargetModal();
	});
});

function setTargetForCurrentMatch() {
	// Existing functionality - set target for current match
	isTargetMode = true;
	targetRuns = parseInt($("#targetRuns").val());
	targetOvers = parseInt($("#targetOvers").val());
	updateTarget();
	// $("#targetBoard").show(2500); // Target now shown in top row
	$("#targetModeButton").hide();
	publishMessage(
		JSON.stringify({
			isTargetMode: isTargetMode,
		})
	);
}

function startSecondInnings() {
	// Get target values from inputs
	const secondInningsTarget = parseInt($("#targetRuns").val());
	const secondInningsOvers = parseInt($("#targetOvers").val());

	// Validate inputs
	if (isNaN(secondInningsTarget) || isNaN(secondInningsOvers)) {
		alert('Please enter valid target runs and overs');
		return;
	}

	// Save 1st innings to history
	saveMatchToHistory('1st');

	// Swap team names for second innings
	const temp = battingTeamName;
	battingTeamName = bowlingTeamName;
	bowlingTeamName = temp;

	// Capture start time for second innings
	const secondInningsStartTime = Date.now();

	// Save target data to localStorage for restoration after reload
	const secondInningsData = {
		isTargetMode: true,
		targetRuns: secondInningsTarget,
		targetOvers: secondInningsOvers,
		isSecondInnings: true,
		battingTeamName: battingTeamName,
		bowlingTeamName: bowlingTeamName,
		startTime: secondInningsStartTime // Save start time
	};
	localStorage.setItem('secondInningsTarget', JSON.stringify(secondInningsData));

	// Clear current match data and reset timing for second innings
	localStorage.removeItem('cricketMatchData');
	matchStartTime = secondInningsStartTime; // Set start time (will be lost on reload but saved in secondInningsData)
	matchEndTime = null; // Clear end time

	// Reload page to start fresh 2nd innings
	location.reload();
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
		// $("#targetBoard").show(2500); // Target now shown in top row
		$("#targetModeButton").hide();
	}
	publishMessage(
		JSON.stringify({
			isTargetMode: isTargetMode,
		})
	);
}

function updateTarget() {
	if (!isTargetMode) {
		// Hide target display in top bar
		$("#targetTopDisplay").hide();
		return;
	}

	const runsRequired = targetRuns - runs;
	const ballsLeft = targetOvers * 6 - ((over_no - 1) * 6 + ball_no - 1);

	// Update top bar display
	$("#targetRunsTopValue").text(runsRequired);
	$("#targetBallsTopValue").text(ballsLeft);
	$("#targetTopDisplay").show();

	// Update old targetBoard display
	updateHtml("#targetRunsRequired", runsRequired);
	if (ballsLeft == 0) {
		// targetRuns is the score to beat (first innings + 1)
		// So first innings score is targetRuns - 1
		const firstInningsScore = targetRuns - 1;

		if (runs > firstInningsScore) {
			$("#targetBody").html(`
				<div style="text-align: center; padding: 20px;">
					<h3 style="color: #28a745; margin-bottom: 20px;">🎉 Hurray! The batting team has Won!! 🎉</h3>
					<div class="d-flex gap-3 justify-content-center">
						<button class="btn btn-success btn-lg" onclick="saveAndExit()" style="min-width: 180px;">💾 Save & Exit</button>
						<button class="btn btn-primary btn-lg" onclick="startFreshMatch()" style="min-width: 180px;">🔄 Start New Match</button>
					</div>
				</div>
			`);
			$("#targetBoard").css("display", "block"); // Override !important to show message
		} else if (runs == firstInningsScore) {
			$("#targetBody").html(`
				<div style="text-align: center; padding: 20px;">
					<h3 style="color: #ffc107; margin-bottom: 20px;">🤝 It's a Tie!! 🤝</h3>
					<div class="d-flex gap-3 justify-content-center">
						<button class="btn btn-success btn-lg" onclick="saveAndExit()" style="min-width: 180px;">💾 Save & Exit</button>
						<button class="btn btn-warning btn-lg" onclick="startFreshMatch()" style="min-width: 180px;">🔄 Start New Match</button>
					</div>
				</div>
			`);
			$("#targetBoard").css("display", "block"); // Override !important to show message
		} else {
			$("#targetBody").html(`
				<div style="text-align: center; padding: 20px;">
					<h3 style="color: #dc3545; margin-bottom: 20px;">😔 The batting team has Lost! 😔</h3>
					<div class="d-flex gap-3 justify-content-center">
						<button class="btn btn-success btn-lg" onclick="saveAndExit()" style="min-width: 180px;">💾 Save & Exit</button>
						<button class="btn btn-danger btn-lg" onclick="startFreshMatch()" style="min-width: 180px;">🔄 Start New Match</button>
					</div>
				</div>
			`);
			$("#targetBoard").css("display", "block"); // Override !important to show message
		}
		$("#targetBoard").css("display", "block"); // Override !important to show result
		$("#targetModeButton").show();
		// Hide target display from top bar when match is over
		$("#targetTopDisplay").hide();
	} else if (runsRequired <= 0) {
		// This means the batting team has already surpassed the target before all balls are played
		$("#targetBody").html(`
			<div style="text-align: center; padding: 20px;">
				<h3 style="color: #28a745; margin-bottom: 20px;">🎉 Hurray! The batting team has Won!! 🎉</h3>
				<div class="d-flex gap-3 justify-content-center">
					<button class="btn btn-success btn-lg" onclick="saveAndExit()" style="min-width: 180px;">💾 Save & Exit</button>
					<button class="btn btn-primary btn-lg" onclick="startFreshMatch()" style="min-width: 180px;">🔄 Start New Match</button>
				</div>
			</div>
		`);
		$("#targetBoard").css("display", "block"); // Override !important to show message
		$("#targetModeButton").show();
		$("#targetTopDisplay").hide();
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
