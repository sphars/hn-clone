// get the root element of the document
const app = document.getElementById('root');

// create the container element
const container = document.createElement('div');
container.setAttribute('class', 'container');

// add container to the document
app.appendChild(container);


// array for stories
var stories = [];

const topStoriesURL = 'https://hacker-news.firebaseio.com/v0/topstories.json';

// function for getting the friendly time elapsed since a date. timestamp is the time in milliseconds
// adapted from https://stackoverflow.com/a/53138036
const getElapsedTime = (timestamp) => {
    if (typeof timestamp !== 'number') return 'NaN';
    
    // timestamp is in milliseconds 
    const SECOND = 1000;
    const MINUTE = 1000 * 60;
    const HOUR = 1000 * 60 * 60;
    const DAY = 1000 * 60 * 60 * 24;
    const MONTH = 1000 * 60 * 60 * 24 * 30;
    const YEAR = 1000 * 60 * 60 * 24 * 30 * 12;
    
    const elapsed = (new Date()).valueOf() - timestamp;
    if(elapsed < 0) return 'Date is in the future';
    
    if (elapsed <= MINUTE) return `${Math.round(elapsed / SECOND)} second${Math.round(elapsed / SECOND) == 1 ? "": "s"} ago`;
    if (elapsed <= HOUR) return `${Math.round(elapsed / MINUTE)} minute${Math.round(elapsed / MINUTE) == 1 ? "": "s"} ago`;
    if (elapsed <= DAY) return `${Math.round(elapsed / HOUR)} hour${Math.round(elapsed / HOUR) == 1 ? "": "s"} ago`;
    if (elapsed <= MONTH) return `${Math.round(elapsed / DAY)} day${Math.round(elapsed / DAY) == 1 ? "": "s"} ago`;
    if (elapsed <= YEAR) return `${Math.round(elapsed / MONTH)} month${Math.round(elapsed / MONTH) == 1 ? "": "s"} ago`;
    return `${Math.round(elapsed / YEAR)} year${Math.round(elapsed / YEAR) == 1 ? "": "s"}`;
}

// get the top HN stories
function getTopStories(){
    fetch(topStoriesURL)
        .then(response => {
            return response.json();
        })
        .then(data => {
            //console.log(data);

            //limit for now
            for(let i = 0; i < 50; i++){
                getStoryDetails(data[i]);
            }
        })
        .catch(err => {
            console.log('error fetching');
        });
}


// get top-level details about a story
function getStoryDetails(itemId){
    let storyURL = `https://hacker-news.firebaseio.com/v0/item/${itemId}.json`

    fetch(storyURL)
        .then(respose => {
            return respose.json();
        })
        .then(data => {
            createStoryCard(data);
            stories.push(data);
        })
        .catch(err => {
            console.log(`error fetching story ${itemId} with ${err}`);
        });

}

// creates HTML markup for a story
function createStoryCard(story){

    // story div
    let storyCard = document.createElement('div');
    storyCard.setAttribute('class', 'story');

    // story title and domain
    let headlineDiv = document.createElement('div');
    headlineDiv.setAttribute('class', 'headline');

    let storyTitle = document.createElement('a');
    storyTitle.setAttribute('class', 'title')
    storyTitle.setAttribute('href', story.url);
    storyTitle.setAttribute('targe', '_blank');
    storyTitle.innerHTML = story.title;

    let domain = document.createElement('span');
    domain.setAttribute('class', 'domain');

    // check if there is a associated url
    if(story.hasOwnProperty('url')){
        domain.textContent = `(${getDomain(story.url)})`;
    } else {
        // set the url to the story itself
        var url = `https://news.ycombinator.com/item?id=${story.id}`
        domain.textContent = `(${getDomain(url)})`;
    }

    // links
    let linkDiv = document.createElement('div');
    linkDiv.setAttribute('class', 'links');

    let hnLink = document.createElement('a');
    hnLink.setAttribute('href', `https://news.ycombinator.com/item?id=${story.id}`);
    hnLink.setAttribute('target', '_blank');

    // check if the story has any comments
    if(story.hasOwnProperty('kids')){
        hnLink.innerHTML = `${story.kids.length} Comments`;
    } else{
        hnLink.innerHTML = `0 Comments`;
    }

    let score = document.createElement('span');
    score.setAttribute('class', 'score');
    score.textContent = `${story.score} points by ${story.by} ${getElapsedTime(story.time * 1000)}`;

    //add the story element
    container.appendChild(storyCard);

    //add story elements
    storyCard.appendChild(headlineDiv);   
    storyCard.appendChild(linkDiv);
    
    //add headline elements
    headlineDiv.appendChild(storyTitle);
    headlineDiv.appendChild(domain);
    
    //add links element
    linkDiv.appendChild(score);
    linkDiv.appendChild(hnLink);

}


// gets the domain from a full url
function getDomain(url){
    let domain = "", page = "";
    
    //remove http://
    if(url.indexOf('http://') == 0){
        url = url.substr(7);
    }

    //remove https://
    if(url.indexOf('https://') == 0){
        url = url.substr(8);
    }

    //remove www.
    if(url.indexOf('www.') == 0 ){
        url = url.substr(4);
    }

    //get everything up to the first '/'
    domain = url.split('/')[0];

    return domain;
}


getTopStories();