
    const display = document.querySelector('.display');
    const buttons = document.querySelectorAll('button');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.textContent;

            // C = clear
            if (btn.classList.contains('clear')) {
                display.value = "";
                return;
            }

            // = = calculate
            if (value === '=') {
                try {
                    display.value = eval(display.value);
                } catch {
                    display.value = "Error";
                }
                return;
            }

            // Add pressed button to display
            display.value += value;
        });
    });
