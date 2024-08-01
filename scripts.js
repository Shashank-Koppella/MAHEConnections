document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.word-button');
    const shuffleButton = document.querySelector('.option-button:nth-child(1)'); // Shuffle button
    const deselectAllButton = document.querySelector('.option-button:nth-child(2)'); // Deselect all button
    const submitButton = document.querySelector('.option-button:nth-child(3)'); // Submit button
    const livesContainer = document.querySelector('.lives-container'); // Lives container
    const gameOverMessage = document.getElementById('game-over-message'); // Game over message
    const title = document.getElementById('title'); // Title element
    const goodJobMessage = document.getElementById('good-job-message'); // Good job message
    const oneAwayMessage = document.getElementById('one-away-message'); // One away message
    let clickCount = 0;
    const maxClicks = 4;
    const groupedButtons = new Set(); // To track already grouped buttons
    let lives = 4; // Initial number of lives

    function updateLives() {
        const heartIcons = livesContainer.querySelectorAll('.life-icon');
        
        // Remove the falling animation class from all hearts
        heartIcons.forEach(icon => {
            // Only remove the falling class if the heart has not yet fallen
            if (!icon.classList.contains('heart-fall')) {
                icon.style.opacity = '1'; // Ensure all hearts are visible
            }
        });
        
        // Apply the falling animation to the current life lost
        if (lives < 4) {
            const lostHeart = heartIcons[3 - lives]; // Select the heart representing the lost life
            lostHeart.classList.add('heart-fall');
            lostHeart.style.opacity = '0'; // Hide after animation
        }
        
        // Deselect all buttons when a life is lost
        if (lives < 4) {
            buttons.forEach((button) => {
                if (button.classList.contains('clicked')) {
                    button.classList.remove('clicked');
                    button.style.color = '#000'; // Reset text color
                }
            });
            clickCount = 0; // Reset click count after life is lost
            updateButtonStates();
        }
        
        // Show game over message if lives reach 0
        if (lives <= 0) {
            gameOverMessage.style.display = 'block';
            setTimeout(() => {
                replaceButtonsWithGroupedButtons();
                revealAllGroups();
                replaceTitle();
            }, 2000); // Replace buttons and reveal all groups after 2 seconds
        }
    }

    function revealAllGroups() {
        const groupedButtonElems = Array.from(document.querySelectorAll('.grouped-button')); // Get all grouped buttons
        let delay = 0; // Initial delay

        groupedButtonElems.forEach((groupedButton) => {
            setTimeout(() => {
                // Ensure the button is visible and revealed
                groupedButton.classList.remove('hidden');
                groupedButton.classList.add('revealed');
                groupedButton.style.opacity = '1'; // Ensure opacity is set to 1 for visibility
            }, delay); // Apply the current delay

            delay += 1000; // Increment the delay for the next button
        });
    }

    function updateButtonStates() {
        if (clickCount === maxClicks) {
            submitButton.disabled = false;
            submitButton.style.backgroundColor = '#fff'; // Ensure the button has a visible color when enabled
            submitButton.style.cursor = 'pointer'; // Change cursor to pointer when enabled
        } else {
            submitButton.disabled = true;
            submitButton.style.backgroundColor = '#a8a7a7'; // Grey out the button when disabled
            submitButton.style.cursor = 'default'; // Change cursor to default when disabled
        }

        if (Array.from(buttons).some((button) => button.classList.contains('clicked'))) {
            deselectAllButton.classList.remove('disabled');
        } else {
            deselectAllButton.classList.add('disabled');
        }
    }

    function areAllClickedInSameGroup() {
        const clickedButtons = Array.from(buttons).filter((button) => button.classList.contains('clicked'));
        if (clickedButtons.length !== maxClicks) return false; // Ensure exactly 4 buttons are clicked
        const groups = new Set(clickedButtons.map((button) => button.getAttribute('group')));
        return groups.size === 1;
    }

    function isOneAway() {
        const clickedButtons = Array.from(buttons).filter((button) => button.classList.contains('clicked'));
        if (clickedButtons.length !== maxClicks) return false; // Ensure exactly 4 buttons are clicked

        const groupCounts = {};
        clickedButtons.forEach((button) => {
            const group = button.getAttribute('group');
            groupCounts[group] = (groupCounts[group] || 0) + 1;
        });

        // Check if any group has exactly 3 buttons
        return Object.values(groupCounts).includes(3);
    }

    function createGroupedButton(group, buttonNames) {
        const existingGroupedButton = document.querySelector(`.grouped-button[data-group="${group}"]`);
        const groupNames = {
            '1': 'Facilities found in Marena',
            '2': 'Things in hostel',
            '3': 'Bluedove Enterprises in HB3',
            '4': 'Words starting with branches in MAHE '
        };
        const groupColors = {
            '1': '#FFC107', // Yellow for group 1
            '2': '#2196F3', // Blue for group 2
            '3': '#4CAF50', // Green for group 3
            '4': '#FF5722'  // Orange for group 4
        };
        const groupName = groupNames[group] || `Group ${group}`; // Get the group name or default
        const groupColor = groupColors[group] || '#d0d0d0'; // Default color if not defined

        const gridContainer = document.querySelector('.grid-container');

        if (existingGroupedButton) {
            return;
        }

        const groupedButton = document.createElement('button');
        groupedButton.className = 'grouped-button hidden'; // Start hidden for animation
        groupedButton.setAttribute('data-group', group);
        groupedButton.style.gridRow = 'span 1'; // Ensure it occupies one grid row
        groupedButton.style.gridColumn = 'span 4'; // Ensure it occupies full width
        groupedButton.style.backgroundColor = groupColor; // Set the background color based on group

        const groupNameElem = document.createElement('div');
        groupNameElem.textContent = groupName;
        groupedButton.appendChild(groupNameElem);

        const buttonNamesElem = document.createElement('div');
        buttonNamesElem.className = 'button-names';
        buttonNamesElem.textContent = buttonNames.join(', ');
        groupedButton.appendChild(buttonNamesElem);

        // Append the grouped button to the top of the grid container
        gridContainer.prepend(groupedButton); // Use prepend to add the button to the top
        groupedButtons.add(groupedButton);

        setTimeout(() => {
            groupedButton.classList.remove('hidden');
            groupedButton.classList.add('revealed');
        }, 0);
    }

    function moveButtonsToNextAvailableRow() {
        const clickedButtons = Array.from(buttons).filter((button) => button.classList.contains('clicked'));
      
        const group = clickedButtons[0].getAttribute('group');
        const buttonNames = clickedButtons.map((button) => button.textContent);
      
        createGroupedButton(group, buttonNames);
      
        clickedButtons.forEach((button) => {
          button.remove(); // Remove from the DOM
        });
      
        // Reinitialize buttons after removal
        updateButtonStates();
        resetButtonStates();
        shuffleButtons(); // Shuffle remaining word-buttons after grouping
        checkForCompletion(); // Check if all buttons have been grouped
    }

    function resetButtonStates() {
        // Reset the state of remaining buttons
        buttons.forEach((button) => {
            button.classList.remove('clicked');
            button.style.color = '#000'; // Reset text color
        });
    }

    function replaceButtonsWithGroupedButtons() {
        const allButtons = Array.from(document.querySelectorAll('.word-button'));
        const gridContainer = document.querySelector('.grid-container');

        const allGroups = [...new Set(allButtons.map((button) => button.getAttribute('group')))];

        allGroups.forEach((group) => {
            const buttonNames = Array.from(
                document.querySelectorAll(`.word-button[group="${group}"]`)
            ).map((btn) => btn.textContent);

            createGroupedButton(group, buttonNames);
        });

        allButtons.forEach((btn) => btn.remove());
    }

    function shuffleButtons() {
        const container = document.querySelector('.grid-container');
        const visibleButtons = Array.from(
            container.querySelectorAll('.word-button:not(.disabled)')
        );

        for (let i = visibleButtons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            container.appendChild(visibleButtons[j]);
        }
    }

    // Initial shuffle
    shuffleButtons();

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            if (!button.classList.contains('clicked') && clickCount < maxClicks) {
                button.classList.add('clicked');
                button.style.color = '#fff'; // Change text color to white
                clickCount++;
            } else if (button.classList.contains('clicked')) {
                button.classList.remove('clicked');
                button.style.color = '#000'; // Reset text color
                clickCount--;
            }
            updateButtonStates();
        });
    });

    deselectAllButton.addEventListener('click', () => {
        buttons.forEach((button) => {
            if (button.classList.contains('clicked')) {
                button.classList.remove('clicked');
                button.style.color = '#000'; // Reset text color
            }
        });
        clickCount = 0;
        updateButtonStates();
    });

    submitButton.addEventListener('click', () => {
        if (areAllClickedInSameGroup()) {
            moveButtonsToNextAvailableRow();
            clickCount = 0; // Reset click count after successful grouping
        } else {
            if (isOneAway()) {
                displayOneAwayMessage(); // Display 'One Away' message on specific condition
            }
            lives--;
            updateLives();
        }
        updateButtonStates();
    });

    shuffleButton.addEventListener('click', () => {
        shuffleButtons();
    });

    function replaceTitle() {
        title.innerHTML = '<span style="color: #000;">MAHE</span> CONNECTIONS';
        title.style.textAlign = 'center'; // Center the text
    }

    function displayOneAwayMessage() {
        oneAwayMessage.style.display = 'block';
        setTimeout(() => {
            oneAwayMessage.style.display = 'none';
        }, 1500);
    }

    function checkForCompletion() {
        const remainingWordButtons = Array.from(document.querySelectorAll('.word-button:not(.disabled)'));

        if (remainingWordButtons.length === 0 && lives > 0) {
            setTimeout(() => {
                goodJobMessage.style.display = 'block';
                replaceTitle();
            }, 2000);
        }
    }
});
