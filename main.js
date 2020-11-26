const searchURL_TM = 'https://app.ticketmaster.com/discovery/v2/events.json';

const apiKeyTM = 'I3s7HGdzn7Y33zNiigtvz7tnmXdNJqMV';

const searchURL_OW = 'https://api.openweathermap.org/data/2.5/onecall';

const apiKeyOW = 'ca33e47fabc12863ac34ba82ffb21974';

// -------------------------------------------- Begin event management functions

function displayEvents(responseJson) {
    $('.removable').remove();
    if (responseJson.page.totalElements > 0) {
        for (let i = 0; i < responseJson._embedded.events.length; i++) {
            $('.results-list').append(`<li id="${cuid()}" class="removable container"><div><p>${responseJson._embedded.events[i].name}</p>
            <p class="date"> Date: <b>${responseJson._embedded.events[i].dates.start.localDate}</b></p>
            <p> Venue: ${responseJson._embedded.events[i]._embedded.venues[0].name}</p>
            <p> Address: ${responseJson._embedded.events[i]._embedded.venues[0].address.line1}</p>
            <p> ${responseJson._embedded.events[i]._embedded.venues[0].city.name}, ${responseJson._embedded.events[i]._embedded.venues[0].state.name} ${responseJson._embedded.events[i]._embedded.venues[0].postalCode}</p>
            <p> Lat: <b class="lat">${responseJson._embedded.events[i]._embedded.venues[0].location.latitude}</b> Long: <b class="long">${responseJson._embedded.events[i]._embedded.venues[0].location.longitude}</b></p>
            
            <button type="submit" class="event">Get Weather Forecast</button>
            </div></li>`);
        $('.results').removeClass('hidden');
        }
    } else {
        $('.results-list').append(`<li id="${cuid()}" class="removable container"><div>
        <p>No results for this search</p>
        </div></li>`);
        $('.results').removeClass('hidden');
    }
}

function paramFormat(params) {
    const queryItems = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    return queryItems.join('&');
  }
  
function getEvents(eInput, sInput) { 

    let params = {
        keyword: eInput,
        stateCode: sInput,
        apikey: apiKeyTM
      };
    
    let prettyParams = paramFormat(params);
    const url = `${searchURL_TM}?${prettyParams}`;

    fetch(url)
    .then(response => {
        if (response.ok) {
            
            if (!$('.error-message').hasClass('hidden')) {
                $('.error-message').addClass('hidden');            
            }
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(responseJson => displayEvents(responseJson))
    .catch(error => {$('.error-message').text(`Something went wrong getting events: ${error.message}`);
    $('.error-message').removeClass('hidden')});
}

function search() {
    $('form').on('click',"button[class='search']", event => {
        event.preventDefault();
        let sInput = $('#state-select').val();
        let eInput = $('#eInput').val().split(' ');
        if (eInput.length > 6) { // cap search input at 6 words
            eInput.splice(6);
        }
        eInput = eInput.join(',');
        getEvents(eInput, sInput);
    });
}

// -------------------------------------------- End event management functions

// -------------------------------------------- Begin weather management functions

function displayWeather(responseJson,itemID,day) {
    /*
    the day parameter will be the value of dayIndex which is calculated in function check7
    see function check7 comments for details
    */

    $(`li[id=${itemID}]`).append(`<div class="removable weather">
    <img src="http://openweathermap.org/img/wn/${responseJson.daily[day].weather[0].icon}@2x.png" alt="weather icon matching description">
    <p> Weather: ${responseJson.daily[day].weather[0].description} </p>
    <p> Max Temp: ${responseJson.daily[day].temp.max}</p>
    <p> Min Temp: ${responseJson.daily[day].temp.min}</p>
    <p> Wind Speed: ${responseJson.daily[day].wind_speed} mph</p>
    
    <button type="submit" class="wHide">Hide</button>
    </div>`);
}

function getWeather(lat, long, itemID, day) { 

    let params = {
        lat: lat,
        lon: long,
        exclude: 'current,minutely,hourly',
        units: 'imperial',
        appid: apiKeyOW
      };

    let prettyParams = paramFormat(params);
    const url = `${searchURL_OW}?${prettyParams}`;

    fetch(url)
    .then(response => {
        if (response.ok) {
            
            if (!$('.error-message').hasClass('hidden')) {
                $('.error-message').addClass('hidden');            
            }
            return response.json();
        } else {
            throw new Error(response.statusText);
        }
    })
    .then(responseJson => displayWeather(responseJson,itemID,day))
    .catch(error => {$('.error-message').text(`Something went wrong getting weather: ${error.message}`);
    $('.error-message').removeClass('hidden')});
}

function upgradeMessage(itemID,daysToGo) {
    $(`li[id=${itemID}]`).append(`<div class="removable weather">
    <p>Upgrade to get weather for events up to 30 days out!</p>
    <img src="http://openweathermap.org/img/wn/11d@2x.png" alt="weather icon matching description">
    <p> Event is ${Math.floor(daysToGo)} days away</p>
    <button type="submit" class="wHide">Hide</button>
    </div>`);
}

function check7(date) {
    let dateISO = date+'T12:00:00.000Z'; // puts event date into ISO format so Date() can be used to make calendar math easy
    let date3 = new Date(dateISO);

    let now = new Date(); // grabs current date
    let diff = (date3 - now); // finds the number of milliseconds between the event date and current date

    diff = diff/86.4e6; // milliseconds to days conversion
    /*
    dayIndex is eventually passed to displayWeather and is used to select the correct index of responseJson.daily
    responseJson.daily is an array of length 8. Index 0 has weather for today and index 7 has weather for the 
    day that is 7 days away
    */
    let dayIndex = Math.floor(diff+1);

    if (diff < 7 ) { // If event is < 7 days out 
        return [true, dayIndex];
    } else {
        return [false, dayIndex];
    }
    }
    
function hideWeather() {
    $('ul').on('click',"button[class='wHide']", event => {
        event.preventDefault();
        $(event.currentTarget).parent().remove();
    });

}
        
function weather() {
    $('ul').on('click',"button[class='event']", event => {
        event.preventDefault();
        let lat = $(event.currentTarget).prev().children('.lat').text();
        let long = $(event.currentTarget).prev().children('.long').text();
        let itemID = $(event.currentTarget).parent().parent().attr('id');

        let eventDate = $(event.currentTarget).siblings('.date').children().text();
        let dayDiff = check7(eventDate);

        // If the li element contains no elements of class weather
        // prevents multiple forcasts for same event
        if ($(`li[id=${itemID}]`).children('.weather').length == 0) { 
            if (dayDiff[0]) {  // If event is < 7 days out          
                getWeather(lat,long,itemID,dayDiff[1]);
            } else {
                //prompt to upgrade and display days to go
                upgradeMessage(itemID,dayDiff[1]);
            }
        }
    });
}

// -------------------------------------------- End weather management functions

// -------------------------------------------- intro fade styling function

function titleCard() {
    $('.hidden2').mouseover(function() {
        $(this).animate({'margin-left':'10px', opacity:0, display:'none'},1000);
    });
}

// -------------------------------------------- end intro fade styling function

function masterFunction() {
    search();
    weather();
    hideWeather();
    titleCard();
}

$(masterFunction);