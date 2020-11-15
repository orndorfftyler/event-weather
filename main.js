const searchURL = 'https://app.ticketmaster.com/discovery/v2/events.json';

const api_key = 'I3s7HGdzn7Y33zNiigtvz7tnmXdNJqMV';

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

function displayEvents(responseJson) {
    $('.removable').remove();
    console.log(typeof responseJson);
    console.log(responseJson);
    //if (responseJson.limit != 0) {
        for (let i = 0; i < responseJson._embedded.events.length; i++) {
            $('.results-list').append(`<li class="removable"><p>${responseJson._embedded.events[i].name}</p>
            <p> Date: ${responseJson._embedded.events[i].dates.start.localDate}</p>
            <p> Venue: ${responseJson._embedded.events[i]._embedded.venues[0].name}</p>
            <p> Address: ${responseJson._embedded.events[i]._embedded.venues[0].address.line1}</p>
            <p> ${responseJson._embedded.events[i]._embedded.venues[0].city.name}, ${responseJson._embedded.events[i]._embedded.venues[0].state.name} ${responseJson._embedded.events[i]._embedded.venues[0].postalCode}</p>
            <p class="latlong"> Lat: <b class="lat">${responseJson._embedded.events[i]._embedded.venues[0].location.latitude}</b> Long: <b class="long">${responseJson._embedded.events[i]._embedded.venues[0].location.longitude}</b></p>
            
            <button type="submit" class="event">Get Weather Forecast</button></li>
            `);
    //    }
    $('.results').removeClass('hidden');
    }
}

//             <p> Info: ${responseJson._embedded.events[i].pleaseNote}</p>


function paramFormat(params) {
    const queryItems = Object.keys(params)
    .map(key => `${key}=${params[key]}`);
    return(queryItems.join('&'));
}

function getEvents(eInput, sInput) { 

    let params = {
        keyword: eInput,
        stateCode: sInput,
        apikey: api_key
      };
    
    let prettyParams = paramFormat(params);
    const url = `${searchURL}?${prettyParams}`;
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

function weather() {
    $('ul').on('click',"button[class='event']", event => {
        event.preventDefault();
        let lat = $(event.currentTarget).prev().children('.lat').text();
        let long = $(event.currentTarget).prev().children('.long').text();
        console.log(lat + long);
        /*
        let sInput = $('#sInput').val();
        console.log(eInput + ' ' + sInput);
        getEvents(eInput, sInput);
        */
    
    });
}

function masterFunction() {
    search();
    weather();
}

$(masterFunction);