let clickCount = 0;

const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');
const countryCode = document.getElementById('countryCode');
const showFilterBtn = document.getElementById('showFilterBtn');
const filterBar = document.getElementById('filterBar');
const countryInputField = document.getElementById('countryInput');
const suggestionsList = document.getElementById('suggestions');

let allCountries = []; // potrzebna do filtrowania

function handleClick() {
    clickCount++;
    clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
    try {
        const response = await fetch('https://restcountries.com/v3.1/all');
        if (!response.ok) {
            throw new Error('Błąd pobierania danych');
        }
        const data = await response.json();
        const countries = data.map(country => country.name.common);
        allCountries = countries; // zapisz wszystkie kraje do zmiennej globalnej
        countryInput.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

function showSuggestions(query) {
    suggestionsList.innerHTML = '';
    if (!query) {
        suggestionsList.style.display = 'none';
        return;
    }

    const matches = allCountries.filter(country =>
        country.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 10); // ogranicz do 10 wyników

    if (matches.length === 0) {
        suggestionsList.style.display = 'none';
        return;
    }

    matches.forEach(country => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.textContent = country;
        li.addEventListener('click', () => {
            countryInputField.value = country;
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';
            getCountryCode(country); // uzupełnij kod kraju
        });
        suggestionsList.appendChild(li);
    });

    suggestionsList.style.display = 'block';
}

// Ukrywanie sugestii po kliknięciu poza
document.addEventListener('click', (e) => {
    if (!suggestionsList.contains(e.target) && e.target !== countryInputField) {
        suggestionsList.style.display = 'none';
    }
});

// Nasłuchiwanie wpisywania
countryInputField.addEventListener('input', (e) => {
    const query = e.target.value;
    showSuggestions(query);
});

function getCountryByIP() {
    fetch('https://get.geojs.io/v1/ip/geo.json')
        .then(response => response.json())
        .then(data => {
            const country = data.country;
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            option.selected = true;
            countryInput.appendChild(option);
            return country;
        })
        .catch(error => {
            console.error('Błąd pobierania danych z serwera GeoJS:', error);
        });
}

function getCountryCode(countryName) {
    const apiUrl = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Błąd pobierania danych');
            }
            return response.json();
        })
        .then(data => {
            const code = data[0].idd.root + data[0].idd.suffixes.join("")
            const option = document.createElement('option');
            option.value = code;
            option.textContent = code;
            option.selected = true;
            countryCode.appendChild(option);
        })
        .catch(error => {
            console.error('Wystąpił błąd:', error);
        });
}

(() => {
    // nasłuchiwania na zdarzenie kliknięcia myszką
    document.addEventListener('click', handleClick);

    document.querySelectorAll('input[name="invoiceChoice"]').forEach(function (radio) {
        radio.addEventListener('change', function () {
            var invoiceFields = document.getElementById('invoiceFields');
            if (document.getElementById('invoiceYes').checked) {
                invoiceFields.style.display = 'block';
            } else {
                invoiceFields.style.display = 'none';
            }
        });
    });

    document.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('form').submit();
        }
        if (event.key === 'Escape') {
            event.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('form-feedback-modal'));
            modal.show();
        }
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            const focusableElements = Array.from(document.querySelectorAll('.mb-3 input, .mb-3 select, .mb-3 textarea'));
            const currentIndex = focusableElements.indexOf(document.activeElement);
            if (event.key === 'ArrowDown' && currentIndex !== -1) {
                const nextElement = focusableElements[currentIndex + 1];
                if (nextElement) {
                    nextElement.focus();
                }
            } else if (event.key === 'ArrowUp' && currentIndex !== -1) {
                const previousElement = focusableElements[currentIndex - 1];
                if (previousElement) {
                    previousElement.focus();
                }
            }
        }
    });

    document.getElementById('form').addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the default form submission behavior

        let isValid = true;
    
        // Validate email
        const email = document.getElementById('exampleInputEmail1');
        const emailError = email.nextElementSibling;
        if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
            emailError.style.display = 'block';
            email.classList.add('is-invalid');
            isValid = false;
        } else {
            emailError.style.display = 'none';
            email.classList.remove('is-invalid');
        }
    
        // Validate phone number
        const phoneNumber = document.getElementById('phoneNumber');
        const phoneError = phoneNumber.parentElement.nextElementSibling;
        if (phoneNumber.value && !/^\d{9}$/.test(phoneNumber.value)) {
            phoneError.style.display = 'block';
            phoneNumber.classList.add('is-invalid');
            isValid = false;
        } else {
            phoneError.style.display = 'none';
            phoneNumber.classList.remove('is-invalid');
        }
    
        // Validate postal code
        const zipCode = document.getElementById('zipCode');
        const zipError = zipCode.nextElementSibling;
        if (zipCode.value && !/^\d{2}-\d{3}$/.test(zipCode.value)) {
            zipError.style.display = 'block';
            zipCode.classList.add('is-invalid');
            isValid = false;
        } else {
            zipError.style.display = 'none';
            zipCode.classList.remove('is-invalid');
        }
    
        // If all fields are valid, show the confirmation modal
        if (isValid) {
            const formData = new FormData(this);
            const summaryList = document.getElementById('form-data-summary');
            summaryList.innerHTML = ''; // Clear previous summary
    
            // Populate the summary list with form data
            formData.forEach((value, key) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${key}: ${value}`;
                summaryList.appendChild(listItem);
            });
    
            // Show the confirmation modal
            const confirmationModal = new bootstrap.Modal(document.getElementById('confirmation-modal'));
            confirmationModal.show();
        }
    });

    const country = getCountryByIP();
    getCountryCode(country);
    fetchAndFillCountries();
})();

document.addEventListener('DOMContentLoaded', () => {
    // Add blur event listeners to validate fields
    document.getElementById('exampleInputEmail1').addEventListener('blur', function () {
        const email = this.value;
        const errorMessage = this.nextElementSibling;
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errorMessage.style.display = 'block';
            this.classList.add('is-invalid');
        } else {
            errorMessage.style.display = 'none';
            this.classList.remove('is-invalid');
        }
    });

    document.getElementById('phoneNumber').addEventListener('blur', function () {
        const phoneNumber = this.value;
        const errorMessage = this.parentElement.nextElementSibling;
        if (phoneNumber && !/^\d{9}$/.test(phoneNumber)) {
            errorMessage.style.display = 'block';
            this.classList.add('is-invalid');
        } else {
            errorMessage.style.display = 'none';
            this.classList.remove('is-invalid');
        }
    });

    document.getElementById('zipCode').addEventListener('blur', function () {
        const zipCode = this.value;
        const errorMessage = this.nextElementSibling;
        if (zipCode && !/^\d{2}-\d{3}$/.test(zipCode)) {
            errorMessage.style.display = 'block';
            this.classList.add('is-invalid');
        } else {
            errorMessage.style.display = 'none';
            this.classList.remove('is-invalid');
        }
    });
});
