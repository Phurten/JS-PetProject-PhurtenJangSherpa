// JS Pet Project Part 3
// Author: Phurten Jang Sherpa
// Date: Aug 10 2025
// Name: Zen Mode
// Version: 1.0
// Description: Interactive meditation app for different moods with timers, audio, and progress

$(document).ready(function () {

    // initializing app state variables
    var currentScreen = 'welcome';   // tracking current visible screen
    var selectedMood = null;         // storing chosen mood
    var selectedSession = null;      // storing chosen session details
    var isPlaying = false;           // tracking if timer and audio are running
    var timeRemaining = 0;           // seconds left in timer
    var totalTime = 0;               // total session duration in seconds
    var timerInterval = null;        // storing interval id for timer
    var soundEnabled = true;         // tracking if sound is on or off

    // quotes to show randomly on load
    var quotes = [
        "“Calmness of mind is one of the beautiful jewels of wisdom.” - James Allen",
        '"Peace comes from within. Do not seek it without." - Buddha',
        '"You have power over your mind, not outside events. Realize this, and you will find strength." - Marcus Aurelius',
        '"The quieter you become, the more you are able to hear." - Rumi',
        '"In the midst of winter, I found there was, within me, an invincible summer." - Albert Camus"'
    ];

    // sessions for each mood
    var sessions = {
        anxious: [
            { type: "breathing", title: "4-7-8 Breathing", duration: 5, description: "Calming breath work to reduce anxiety" },
            { type: "meditation", title: "Anxiety Relief", duration: 10, description: "Guided meditation for peace of mind" }
        ],
        tired: [
            { type: "powernap", title: "Power Nap", duration: 20, description: "Restorative rest to recharge energy" },
            { type: "meditation", title: "Energy Restoration", duration: 10, description: "Gentle meditation to restore vitality" }
        ],
        restless: [
            { type: "breathing", title: "Box Breathing", duration: 5, description: "Structured breathing to find stillness" },
            { type: "meditation", title: "Grounding Practice", duration: 10, description: "Meditation to center yourself" }
        ],
        overwhelmed: [
            { type: "breathing", title: "Reset Breathing", duration: 5, description: "Clear mental clutter" },
            { type: "meditation", title: "Stress Release", duration: 10, description: "Let go of tension and pressure" }
        ]
    };

    // setting quote, binding events, and showing welcome screen
    function init() {
        setDailyQuote();     
        bindEvents();        
        showScreen('welcome');  // displaying welcome screen by default
    }

    // a random quote on page load
    // picking a random item from array - Aug 10 2025 - https://stackoverflow.com/a/5915122
    function setDailyQuote() {
        var quote = quotes[Math.floor(Math.random() * quotes.length)];
        $('#daily-quote').text(quote);
    }

    // showing the specified screen 
    function showScreen(screenName) {
        $('.screen').removeClass('active');          // hiding all screens
        $(`#${screenName}-screen`).addClass('active');  
        currentScreen = screenName;                  
    }

    // formatting seconds into minutes:seconds format
    function formatTime(seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return mins + ":" + secs.toString().padStart(2, '0');
    }

    // starting the countdown timer for the session
    function startTimer() {
        if (timerInterval) clearInterval(timerInterval); // clearing previous timer if any

        timerInterval = setInterval(function () {
            if (timeRemaining > 0) {
                timeRemaining--;                                
                $('#timer').text(formatTime(timeRemaining));   // updating timer display

                // calculating progress percentage and updating progress bar width
                var progress = ((totalTime - timeRemaining) / totalTime) * 100;
                $('#progress-fill').css('width', progress + '%');

            } else {
                // finishing session when timer hits zero
                clearInterval(timerInterval);      // stopping timer interval
                isPlaying = false;                 
                showScreen('complete');            // showing session complete screen  

                // pausing session audio
                var chimeAudio = $('#chime-audio')[0];
                chimeAudio.pause();

                // playing completion audio
                var completionAudio = document.getElementById('completion-audio');
                if (soundEnabled) {
                    completionAudio.currentTime = 0;
                    completionAudio.play();
                }
            }
        }, 1000); 
    }

    // stopping the countdown timer
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);    // clearing timer interval
            timerInterval = null;            
        }
    }

    // resetting the timer and progress bar to initial state
    function resetTimer() {
        timeRemaining = totalTime;           
        $('#timer').text(formatTime(timeRemaining));  // updating timer display
        $('#progress-fill').css('width', '0%');       // resetting progress bar width
    }

    // list of sessions based on selected mood
    function populateSessionList(mood) {
        var sessionList = $('#session-list');
        sessionList.empty();    // clearing previous sessions

        var moodSessions = sessions[mood]; 
        moodSessions.forEach(function (session, index) {
            // creating HTML for each session item
            var sessionItem = $(`
                <div class="session-item" data-session-index="${index}">
                    <div class="session-content-wrapper">
                        <h3 class="session-item-title">${session.title}</h3>
                        <p class="session-item-description">${session.description}</p>
                        <span class="session-duration">${session.duration} min</span>
                    </div>
                    <svg class="session-play-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5,3 19,12 5,21"/>
                    </svg>
                </div>
            `);
            sessionList.append(sessionItem);  // adding session to the list
        });
    }

    // starting the selected session and updating ui accordingly
    function startSession(sessionIndex) {
        selectedSession = sessions[selectedMood][sessionIndex];    // getting chosen session
        totalTime = selectedSession.duration * 60;                  
        timeRemaining = totalTime;                                  

        // updating ui with session title and resetting timer display and progress bar
        $('#session-title').text(selectedSession.title);
        $('#timer').text(formatTime(timeRemaining));
        $('#progress-fill').css('width', '0%');

        // setting instructions and audio file based on session type
        var chimeAudio = $('#chime-audio')[0];
        var instructions = '';

        // list of guided meditation session titles
        var guidedTitles = ["Anxiety Relief", "Energy Restoration", "Grounding Practice", "Stress Release"];

        // choosing instructions and audio based on type and title
        // Array.prototype.includes for title check - Aug 10 2025 - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
        if (selectedSession.type === 'breathing') {
            if (selectedSession.title.includes('4-7-8')) {
                instructions = '<p class="instructions-title">Follow the rhythm:</p><p class="instructions-text breathing">Inhale 4 • Hold 7 • Exhale 8</p>';
            } else {
                instructions = '<p class="instructions-title">Follow the rhythm:</p><p class="instructions-text breathing">Inhale 4 • Hold 4 • Exhale 4</p>';
            }
            chimeAudio.src = 'assets/sounds/zen-meditation.mp3';  // default meditation audio file
        }
        else if (selectedSession.type === 'powernap') {
            instructions = '<p class="instructions-text">Close your eyes and rest. You\'ll be gently awakened.</p>';
            chimeAudio.src = 'assets/sounds/zen-garden-20.mp3';  // power nap audio file
        }
        else if (selectedSession.type === 'meditation' && guidedTitles.includes(selectedSession.title)) {
            instructions = '<p class="instructions-text">Follow the guided meditation and relax.</p>';
            chimeAudio.src = 'assets/sounds/guided-meditation.mp3';  // guided meditation audio file
        }
        else if (selectedSession.type === 'meditation') {
            instructions = '<p class="instructions-text">Find a comfortable position and focus on your breath.</p>';
            chimeAudio.src = 'assets/sounds/zen-meditation.mp3';  // default meditation audio file
        }

        $('#session-instructions').html(instructions);

        // moving to active session screen
        showScreen('active');
    }

    // play and pause for timer and audio
    function togglePlayPause() {
        isPlaying = !isPlaying;                         // switching play state
        var chimeAudio = $('#chime-audio')[0];

        if (isPlaying) {
            $('.play-icon').addClass('hidden');        // hiding play icon
            $('.pause-icon').removeClass('hidden');   // showing pause icon
            if (soundEnabled) chimeAudio.play();       // playing audio if sound enabled
            startTimer();                              
        } else {
            $('.play-icon').removeClass('hidden');    // showing play icon
            $('.pause-icon').addClass('hidden');     // hiding pause icon
            stopTimer();                              // stopping timer
            chimeAudio.pause();                        // pausing audio
        }
    }

    // Toggling sound on and off
    function toggleSound() {
        soundEnabled = !soundEnabled;                   
        var chimeAudio = $('#chime-audio')[0];
        chimeAudio.muted = !soundEnabled;               // muting/unmuting audio

        if (soundEnabled) {
            $('.sound-on').removeClass('hidden');       // showing sound on icon
            $('.sound-off').addClass('hidden');         // hiding sound off icon
            if (isPlaying) chimeAudio.play();            
        } else {
            $('.sound-on').addClass('hidden');          // hiding sound on icon
            $('.sound-off').removeClass('hidden');      // showing sound off icon
            chimeAudio.pause();                          // pausing audio
        }
    }

    // binding all user interface events
    function bindEvents() {

        // moving to mood screen from welcome
        $('#start-btn').on('click', function () {
            showScreen('mood');
        });

        // navigating back buttons and stopping sounds
        $('#mood-back-btn').on('click', function () {
            stopAllSounds();
            showScreen('welcome');
        });
        $('#session-back-btn').on('click', function () {
            stopAllSounds();
            showScreen('mood');
        });
        $('#active-back-btn').on('click', function () {
            stopTimer();
            isPlaying = false;
            resetPlayIcons();
            stopAllSounds();
            showScreen('session');
        });
        $('#complete-back-btn').on('click', function () {
            showScreen('active');
        });

        // selecting mood and showing sessions
        $('.mood-option').on('click', function () {
            selectedMood = $(this).data('mood');
            var moodLabel = $(this).find('.mood-label').text();
            $('#current-mood-badge').text("Feeling " + moodLabel);
            populateSessionList(selectedMood);
            showScreen('session');
        });

        // selecting session from list
        // jQuery event delegation for dynamic elements - Aug 10 2025 - https://learn.jquery.com/events/event-delegation/
        $(document).on('click', '.session-item', function () {
            startSession($(this).data('session-index'));
        });

        // controlling play/pause button
        $('#play-pause-btn').on('click', togglePlayPause);

        // resetting timer and restarting session
        $('#reset-btn').on('click', function () {
            stopTimer();
            isPlaying = true;
            $('.play-icon').addClass('hidden');
            $('.pause-icon').removeClass('hidden');
            resetTimer();

            var chimeAudio = $('#chime-audio')[0];
            chimeAudio.pause();
            chimeAudio.currentTime = 0;
            if (soundEnabled) chimeAudio.play();

            startTimer();
        });

        // toggling sound on/off
        $('#sound-btn').on('click', toggleSound);

        // handling completion screen buttons
        $('#another-session-btn, #return-home-btn').on('click', function () {
            selectedMood = null;
            selectedSession = null;

            // choosing screen based on button pressed
            if ($(this).attr('id') === 'return-home-btn') {
                showScreen('welcome');
            } else {
                showScreen('mood');
            }

            var completionAudio = document.getElementById('completion-audio');
            completionAudio.pause();
            completionAudio.currentTime = 0;
        });
    }

    // resetting play and pause icons to default state
    function resetPlayIcons() {
        $('.play-icon').removeClass('hidden');
        $('.pause-icon').addClass('hidden');
    }

    // stopping all playing sounds and resetting audio elements
    function stopAllSounds() {
        var chimeAudio = document.getElementById('chime-audio');
        var completionAudio = document.getElementById('completion-audio');
        chimeAudio.pause();
        completionAudio.pause();
        completionAudio.currentTime = 0;
    }

    // starting the app by initializing everything
    init();
});
