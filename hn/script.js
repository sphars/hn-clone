// get the root element of the document
const app = document.getElementById('root');

// create the container element
const container = document.createElement('div');
container.setAttribute('class', 'container');

// add container to the document
app.appendChild(container);

// endpoints for the different stories
const BASEURL = 'https://hacker-news.firebaseio.com/v0/';
const TOPSTORIES = 'topstories.json';
const NEWSTORIES = 'newstories.json';
const BESTSTORIES = 'beststories.json';
const ASKSTORIES = 'askstories.json';
const SHOWSTORIES = 'showstories.json';
const JOBSTORIES = 'jobstories.json';

// top nav elements
const topNav = document.getElementById('top');
const newNav = document.getElementById('new');
const bestNav = document.getElementById('best');
const askNav = document.getElementById('ask');
const showNav = document.getElementById('show');
const jobNav = document.getElementById('jobs');

var navItems = document.getElementsByClassName('nav-item');

for (var i=0; i<navItems.length; i++){
    navItems[i].addEventListener('click', changeNav);
}

// array for stories
var stories = [];

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

// get a nicely formatted time
const getNiceTime = (timestamp) => {
    var a = new Date(timestamp * 1000);

    var lang;
    if(window.navigator.languages){
        lang = window.navigator.languages[0];
    } else{
        lang = window.navigator.userLanguage || window.navigator.language;
    }
    var time = a.toLocaleString(lang, {weekday: 'short', year:'numeric', month:'short', day:'numeric', hour:'numeric', minute:'numeric', hour12:true});
    return time;
}

// get the top HN stories
function getStories(feed){
    fetch(BASEURL + feed)
        .then(response => {
            return response.json();
        })
        .then(data => {
            console.log(`Num stories: ${data.length}`);

            //limit for now
            for(let i = 0; i < data.length && i < 50 ; i++){
                getStoryDetails(data[i]);
            }
        })
        .catch(err => {
            console.log('error fetching ' + err);
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

function clearStories(){
    stories.length = 0;
    var storyElements = document.getElementsByClassName('story');

    while(storyElements.length > 0){
        storyElements[0].parentNode.removeChild(storyElements[0]);
    }
}

// creates HTML markup for a story
function createStoryCard(story){

    // story div
    let storyCard = document.createElement('div');
    storyCard.setAttribute('class', 'story');

    // headline div
    let headline = document.createElement('div');
    headline.setAttribute('class', 'headline');

    // story title and domain
    let storyTitle = document.createElement('a');
    storyTitle.setAttribute('class', 'title')
    storyTitle.setAttribute('targe', '_blank');
    storyTitle.innerHTML = story.title;

    let domain = document.createElement('span');
    domain.setAttribute('class', 'domain');

    // check if there is a associated url
    if(story.hasOwnProperty('url')){
        domain.textContent = `(${getDomain(story.url)})`;
        storyTitle.setAttribute('href', story.url);
    } else {
        // set the url to the story itself
        var url = `https://news.ycombinator.com/item?id=${story.id}`
        domain.textContent = `(${getDomain(url)})`;
        storyTitle.setAttribute('href', url);
    }

    // subtext links
    let subtext = document.createElement('div');
    subtext.setAttribute('class', 'subtext');
    
    // get the score of the story
    let score = document.createElement('span');
    score.setAttribute('class', 'score');
    score.textContent = `${story.score} points `;
    if (story.score >= 300){
        score.className += ' hot';
    }
    
    // get the user who posted the story
    let authorSpan = document.createElement('span');
    let author = document.createElement('a');
    author.setAttribute('href', `https://news.ycombinator.com/user?id=${story.by}`);
    author.setAttribute('target', '_blank');
    author.textContent = `${story.by}`;    
    authorSpan.append(author);
    
    // set time elapsed
    let timeElapse = document.createElement('span');
    timeElapse.innerText = `${getElapsedTime(story.time * 1000)}`;
    timeElapse.title = `${getNiceTime(story.time)}`
    
    // link to the story
    let hnLink = document.createElement('a');
    hnLink.setAttribute('href', `https://news.ycombinator.com/item?id=${story.id}`);
    hnLink.setAttribute('target', '_blank');

    // check if the story has any comments
    if(story.hasOwnProperty('descendants')){
        hnLink.innerText = `${story.descendants} Comments`;
        if(story.descendants >= 100) hnLink.setAttribute('class', 'hot');
    } else{
        hnLink.innerText = '0 Comments';
    }

    //add the story element
    container.appendChild(storyCard);

    //add story elements
    storyCard.appendChild(headline);   
    storyCard.appendChild(subtext);
    
    //add headline elements
    headline.appendChild(storyTitle);
    headline.appendChild(domain);
    
    //add links element
    subtext.append(score, ' by ', authorSpan, ' ', timeElapse, ' | ', hnLink);

}

// get the domain from a full url
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

// change navigation between the different feeds
function changeNav(){
    for (var i=0; i<navItems.length; i++){
        navItems[i].classList.remove('selected');
    }

    clearStories();
    
    this.className += ' selected';
    console.log(this.id);

    switch (this.id) {
        case 'top':
            getStories(TOPSTORIES);
            break;    
        case 'new':
            getStories(NEWSTORIES);
            break;
        case 'best':
            getStories(BESTSTORIES);
            break;
        case 'ask':
            getStories(ASKSTORIES);
            break;
        case 'show':
            getStories(SHOWSTORIES);
            break;
        case 'jobs':
            getStories(JOBSTORIES);
            break;
        default:
            getStories(TOPSTORIES);
    }
}

// load something on first load
window.onload = getStories(TOPSTORIES);