const searchURL_TM = 'https://app.ticketmaster.com/discovery/v2/events.json';

const apiKeyTM = 'I3s7HGdzn7Y33zNiigtvz7tnmXdNJqMV';

const searchURL_OW = 'https://api.openweathermap.org/data/2.5/onecall';

const apiKeyOW = 'ca33e47fabc12863ac34ba82ffb21974';


// not using options??
const options = {
    headers: new Headers({
    'accept':'application/vnd.github.v3+json'})
};
/*
for (var pair of options.headers.entries()) {
    console.log(pair[0]+ ': '+ pair[1]);
 }
 */
 
// use this display function 

// -------------------------------------------- Begin event management functions

function displayEvents(responseJson) {
    $('.removable').remove();
    console.log(typeof responseJson);
    console.log(responseJson);
    for (let i = 0; i < responseJson._embedded.events.length; i++) {
        $('.results-list').append(`<li id="${cuid()}" class="removable container"><div><p>${responseJson._embedded.events[i].name}</p>
        <p class="date"> Date: <b>${responseJson._embedded.events[i].dates.start.localDate}</b></p>
        <p> Venue: ${responseJson._embedded.events[i]._embedded.venues[0].name}</p>
        <p> Address: ${responseJson._embedded.events[i]._embedded.venues[0].address.line1}</p>
        <p> ${responseJson._embedded.events[i]._embedded.venues[0].city.name}, ${responseJson._embedded.events[i]._embedded.venues[0].state.name} ${responseJson._embedded.events[i]._embedded.venues[0].postalCode}</p>
        <p> Lat: <b class="lat">${responseJson._embedded.events[i]._embedded.venues[0].location.latitude}</b> Long: <b class="long">${responseJson._embedded.events[i]._embedded.venues[0].location.longitude}</b></p>
        
        <button type="submit" class="event">Get Weather Forecast</button></div></li>
        `);
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
    console.log(url);

    //const url = `${searchURL}${eInput}/repos`; 

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
        let eInput = $('#eInput').val();
        let sInput = $('#sInput').val();
        console.log(eInput + ' ' + sInput);
        getEvents(eInput, sInput);


    });
}

// -------------------------------------------- End event management functions

// -------------------------------------------- Begin weather management functions

function hideWeather() {
    $('ul').on('click',"button[class='wHide']", event => {
        event.preventDefault();
        $(event.currentTarget).parent().remove();
    });

}


function displayWeather(responseJson,itemID) {
    //$('.removable').remove();
    console.log(typeof responseJson);
    console.log(responseJson);
    //let targetDate = dateCalc(date);


    let date = new Date(responseJson.daily[0].dt*1000);
        $(`li[id=${itemID}]`).append(`<div class="removable weather">
        <p>${date}</p>
        <img src="http://openweathermap.org/img/wn/${responseJson.daily[0].weather[0].icon}@2x.png" alt="weather icon matching description">
        <p> Weather: ${responseJson.daily[0].weather[0].description} </p>
        <p> Max Temp: ${responseJson.daily[0].temp.max}</p>
        <p> Min Temp: ${responseJson.daily[0].temp.min}</p>
        <p> Wind Speed: ${responseJson.daily[0].wind_speed} mph</p>
        
        <button type="submit" class="wHide">Hide</button>
        </div>`);
    //$('.results').removeClass('hidden');
    
}


function getWeather(lat, long, itemID, date) { 

    let params = {
        lat: lat,
        lon: long,
        exclude: 'current,minutely,hourly',
        units: 'imperial',
        appid: apiKeyOW
      };
    

    let prettyParams = paramFormat(params);
    const url = `${searchURL_OW}?${prettyParams}`;
    console.log(url);

    //const url = `${searchURL}${eInput}/repos`; 

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
    .then(responseJson => displayWeather(responseJson,itemID,date))
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
    //event date minus current date => index of .daily
    // day = 0 => current day
    let dateISO = date+'T12:00:00.000Z';
    let date3 = new Date(dateISO);

    let now = new Date();
    let diff = (date3 - now);
    console.log('diff is ' + diff);
    let diffDays = diff/86.4e6;
    console.log('diff in days ' + diffDays);

    if (diffDays < 7 ) {
        return [true];
    } else {
        return [false, diffDays];
    }
    }
    
function weather() {
    $('ul').on('click',"button[class='event']", event => {
        event.preventDefault();
        let lat = $(event.currentTarget).prev().children('.lat').text();
        let long = $(event.currentTarget).prev().children('.long').text();
        let itemID = $(event.currentTarget).parent().parent().attr('id');
        let date = $(event.currentTarget).siblings('.date').children().text();

        if ($(`li[id=${itemID}]`).children('.weather').length == 0) {
            if (check7(date)[0]) {            
                console.log(lat + long + itemID);
                getWeather(lat,long,itemID,date);
            } else {
                //display days to go and prompt to upgrade
                upgradeMessage(itemID,check7(date)[1]);
            }
        }
    });
}

// -------------------------------------------- End event management functions

function masterFunction() {
    search();
    weather();
    hideWeather();
}

$(masterFunction);