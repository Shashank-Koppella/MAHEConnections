document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.word-button');
    const shuffleButton = document.querySelector('.option-button:nth-child(1)'); // Shuffle button
    const deselectAllButton = document.querySelector('.option-button:nth-child(2)'); // Deselect all button
    const submitButton = document.querySelector('.option-button:nth-child(3)'); // Submit button
    const livesContainer = document.querySelector('.lives-container'); // Lives container
    const gameOverMessage = document.getElementById('game-over-message'); // Game over message
    const title = document.getElementById('title'); // Title element
    let clickCount = 0;
    const maxClicks = 4;
    const groupedButtons = new Set(); // To track already grouped buttons
    const occupiedRows = new Set(); // To track rows occupied by grouped buttons
    let lives = 4; // Initial number of lives

    // Function to update lives display
    function updateLives() {
        livesContainer.querySelectorAll('.life-icon').forEach((icon, index) => {
            icon.style.visibility = index < lives ? 'visible' : 'hidden';
        });

        // Show game over message if lives reach 0
        if (lives <= 0) {
            gameOverMessage.style.display = 'block';
            setTimeout(replaceButtonsWithGroupedButtons, 2000); // Replace buttons after 2 seconds
            setTimeout(revealAllGroups, 2000); // Call revealAllGroups after 2 seconds
            setTimeout(replaceTitle, 2000); // Replace title after 2 seconds
        }
    }

    // Function to reveal all groups with a delay
    function revealAllGroups() {
        const groupedButtonElems = Array.from(
            document.querySelectorAll('.grouped-button')
        ); // Get all grouped buttons
        groupedButtonElems.forEach((groupedButton, index) => {
            groupedButton.style.visibility = 'visible';
        });
    }

    // Function to replace title
    function replaceTitle() {
        // Remove the current title element
        title.style.display = 'none';

        // Create a new title element with the same content
        const newTitleElement = document.createElement('h1');
        newTitleElement.className = 'title new-title';
        newTitleElement.innerHTML = `
            <span class="main">MAHE</span>
            <span class="sub">CONNECTIONS</span>
        `;

        // Insert the new title element in the same place
        title.parentNode.insertBefore(newTitleElement, title.nextSibling);
    }

    // Function to update button states
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

        if (Array.from(buttons).some((button) =>
            button.classList.contains('clicked')
        )) {
            deselectAllButton.classList.remove('disabled');
        } else {
            deselectAllButton.classList.add('disabled');
        }
    }

    // Function to check if all clicked buttons are in the same group
    function areAllClickedInSameGroup() {
        const clickedButtons = Array.from(buttons).filter((button) =>
            button.classList.contains('clicked')
        );
        const groups = new Set(
            clickedButtons.map((button) => button.getAttribute('group'))
        );
        return groups.size === 1;
    }

    // Function to create or update the grouped button
    function createGroupedButton(group, rowIndex, buttonNames) {
        const existingGroupedButton = document.querySelector(
            `.grouped-button[data-group="${group}"]`
        );
        const groupNames = {
            '1': 'Places in Marena',
            '2': 'Places in ACAD',
            '3': 'Things found in Siri',
            '4': 'Words starting with first year subjects'
        };
        const groupName = groupNames[group] || `Group ${group}`; // Get the group name or default

        const gridContainer = document.querySelector('.grid-container');

        // If a grouped button for this group already exists, just update it
        if (existingGroupedButton) {
            existingGroupedButton.style.gridRow = rowIndex; // Ensure it is in the correct row
            return;
        }

        // Create a new grouped button
        const groupedButton = document.createElement('button');
        groupedButton.className = 'grouped-button';
        groupedButton.setAttribute('data-group', group);
        groupedButton.style.gridRow = rowIndex; // Ensure it is in the correct row

        // Add group name
        const groupNameElem = document.createElement('div');
        groupNameElem.textContent = groupName;
        groupedButton.appendChild(groupNameElem);

        // Add button names
        const buttonNamesElem = document.createElement('div');
        buttonNamesElem.className = 'button-names';
        buttonNamesElem.textContent = buttonNames.join(', ');
        groupedButton.appendChild(buttonNamesElem);

        // Add new grouped button to the grid container
        gridContainer.appendChild(groupedButton);

        // Add to groupedButtons set
        groupedButtons.add(groupedButton);
    }

    // Function to move buttons to the next available row
    function moveButtonsToNextAvailableRow() {
        const gridContainer = document.querySelector('.grid-container');
        const clickedButtons = Array.from(buttons).filter((button) =>
            button.classList.contains('clicked')
        );

        // Sort buttons by their order of appearance
        clickedButtons.sort((a, b) => {
            const indexA = Array.from(buttons).indexOf(a);
            const indexB = Array.from(buttons).indexOf(b);
            return indexA - indexB;
        });

        // Determine the next available row
        let rowIndex = 1;
        while (occupiedRows.has(rowIndex)) {
            rowIndex++;
        }
        occupiedRows.add(rowIndex);

        // Get the group and button names
        const group = clickedButtons[0].getAttribute('group');
        const buttonNames = clickedButtons.map((button) => button.textContent);

        // Create the grouped button
        createGroupedButton(group, rowIndex, buttonNames);

        // Remove the original buttons that are now grouped
        clickedButtons.forEach((button) => {
            button.remove(); // Remove from the DOM
        });

        // Ensure grouped buttons remain in place
        buttons.forEach((button) => {
            if (!groupedButtons.has(button)) {
                button.style.gridRow = 'auto';
                button.style.gridColumn = 'auto';
            }
        });
    }

    // Function to replace original buttons with grouped buttons upon game over
    function replaceButtonsWithGroupedButtons() {
        const allButtons = Array.from(document.querySelectorAll('.word-button'));
        let currentRowIndex = 1; // Start with the first row

        allButtons.forEach((button) => {
            const group = button.getAttribute('group');
            const buttonNames = Array.from(
                document.querySelectorAll(`.word-button[group="${group}"]`)
            ).map((btn) => btn.textContent);

            // Determine the next available row for the current group
            while (occupiedRows.has(currentRowIndex)) {
                currentRowIndex++;
            }
            occupiedRows.add(currentRowIndex);

            // Create the grouped button for this group
            createGroupedButton(group, currentRowIndex, buttonNames);
        });

        // Remove original buttons
        allButtons.forEach((btn) => btn.remove());
    }

    // Add click event listener to shuffle button
    shuffleButton.addEventListener('click', () => {
        buttons.forEach((button) => {
            if (!groupedButtons.has(button)) {
                button.style.order = Math.floor(Math.random() * buttons.length); // Apply new order
            }
        });
    });

    // Add click event listener to deselect all button
    deselectAllButton.addEventListener('click', () => {
        buttons.forEach((button) => {
            if (button.classList.contains('clicked')) {
                button.classList.remove('clicked');
                button.style.backgroundColor = '#efefe6'; // Reset background color
                clickCount--;
            }
        });

        if (clickCount < maxClicks) {
            buttons.forEach((btn) => {
                if (btn.classList.contains('disabled') && !groupedButtons.has(btn)) {
                    btn.classList.remove('disabled');
                }
            });
        }

        updateButtonStates(); // Update button states to reflect changes
    });

    // Add click event listener to submit button
    submitButton.addEventListener('click', () => {
        if (submitButton.disabled) {
            return; // Prevent any action if the button is disabled
        }

        if (areAllClickedInSameGroup()) {
            moveButtonsToNextAvailableRow();
        } else {
            lives--;
            updateLives();
        }

        // Reset clicked buttons
        buttons.forEach((button) => {
            if (button.classList.contains('clicked')) {
                button.classList.remove('clicked');
                button.style.backgroundColor = '#efefe6'; // Reset background color
            }
        });

        clickCount = 0;
        updateButtonStates(); // Update button states after submission
    });

    // Add click event listener to word buttons
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            if (groupedButtons.has(button)) {
                return; // Prevent interaction with already grouped buttons
            }

            if (!button.classList.contains('clicked') && clickCount < maxClicks) {
                button.classList.add('clicked');
                button.style.backgroundColor = '#5a594e'; // Change background color
                clickCount++;
            } else if (button.classList.contains('clicked')) {
                button.classList.remove('clicked');
                button.style.backgroundColor = '#efefe6'; // Reset background color
                clickCount--;
            }

            if (clickCount === maxClicks) {
                buttons.forEach((btn) => {
                    if (!btn.classList.contains('clicked') && !groupedButtons.has(btn)) {
                        btn.classList.add('disabled');
                    }
                });
            } else {
                buttons.forEach((btn) => {
                    if (btn.classList.contains('disabled') && !groupedButtons.has(btn)) {
                        btn.classList.remove('disabled');
                    }
                });
            }

            // Display 'One away' message if 3 out of 4 are from the same group
            if (clickCount === maxClicks - 1) {
                const clickedButtons = Array.from(buttons).filter((btn) =>
                    btn.classList.contains('clicked')
                );
                const groups = new Set(
                    clickedButtons.map((btn) => btn.getAttribute('group'))
                );
                if (groups.size === 1) {
                    const oneAwayMessage = document.createElement('div');
                    oneAwayMessage.className = 'one-away-message';
                    oneAwayMessage.textContent = 'One away';
                    document.body.appendChild(oneAwayMessage);

                    setTimeout(() => {
                        oneAwayMessage.remove(); // Remove the message after 4 seconds
                    }, 4000);
                }
            }

            updateButtonStates(); // Update button states after click
        });
    });

    // Shuffle buttons continuously until mouse movement is detected
    let shuffleInterval = setInterval(() => {
        shuffleButton.click(); // Simulate shuffle button click
    }, 100); // Shuffle every 100ms

    // Stop shuffling when mouse movement is detected
    const stopShufflingOnMouseMovement = () => {
        clearInterval(shuffleInterval); // Clear the interval to stop shuffling
        window.removeEventListener('mousemove', stopShufflingOnMouseMovement); // Remove the mousemove event listener
    };

    // Add event listener for mouse movement
    window.addEventListener('mousemove', stopShufflingOnMouseMovement);
});
