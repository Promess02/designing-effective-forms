let clickCount = 0;

const countryInput = document.getElementById('country');
const myForm = document.getElementById('form');
const modal = document.getElementById('form-feedback-modal');
const clicksInfo = document.getElementById('click-count');
const countryCode = document.getElementById('countryCode');

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
        countryInput.innerHTML = countries.map(country => `<option value="${country}">${country}</option>`).join('');
    } catch (error) {
        console.error('Wystąpił błąd:', error);
    }
}

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

    document.querySelectorAll('input[name="invoiceChoice"]').forEach(function(radio) {
        radio.addEventListener('change', function() {
            var invoiceFields = document.getElementById('invoiceFields');
            if (document.getElementById('invoiceYes').checked) {
                invoiceFields.style.display = 'block';
            } else {
                invoiceFields.style.display = 'none';
            }
        });
    });

    fetchAndFillCountries();
    const country = getCountryByIP();
    getCountryCode(country);
})()
