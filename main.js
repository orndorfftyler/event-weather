const searchURL = 'https://app.ticketmaster.com/discovery/v2/events.json';

const api_key = 'I3s7HGdzn7Y33zNiigtvz7tnmXdNJqMV';

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

function displayResults(responseJson) {
    $('.removable').remove();
    console.log(responseJson);
    //if (responseJson.limit != 0) {
        for (let i = 0; i < responseJson.data.length; i++) {
            $('.results-list').append(`<li class="removable"><p>${responseJson.data[i].fullName}</p>
            <p></p>
            <p>${responseJson.data[i].description}</p>
            <a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].url}</a></li>`);
    //    }
    $('.results').removeClass('hidden');
    }
}

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
    .then(responseJson => displayResults(responseJson))
    .catch(error => {$('.error-message').text(`Something went wrong: ${error.message}`);
    $('.error-message').removeClass('hidden')});

}

function search() {
    $('form').on('click','button', event => {
        event.preventDefault();
        let eInput = $('#eInput').val();
        let sInput = $('#sInput').val();
        console.log(eInput + ' ' + sInput);
        getEvents(eInput, sInput);
    });
}

function masterFunction() {
    search();

}

$(masterFunction);